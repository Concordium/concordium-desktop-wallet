/* eslint-disable @typescript-eslint/no-var-requires */
// electron-builder writes a per-arch `<channel>-mac.yml` auto-update manifest
// (e.g. stagenet-mac.yml) into each macOS build's output directory. Since we
// build x64 and arm64 in separate CI jobs, both jobs produce a manifest with
// the *same* filename, each only describing that job's own artifact. If left
// alone, flattening both job outputs into one release upload directory would
// make one silently clobber the other, so electron-updater (MacUpdater) would
// only ever see one architecture's build and could offer the wrong one.
//
// This merges the `files` entries of same-named manifests from multiple
// directories into one manifest per channel, written into the given output
// directory, so electron-updater can pick the right entry for the running
// architecture (it matches on the "arm64" substring in the file name).
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function main() {
    const [, , outDir, ...sourceDirs] = process.argv;
    if (!outDir || sourceDirs.length < 1) {
        console.error(
            'Usage: merge-mac-update-manifests.js <outDir> <sourceDir> [...moreSourceDirs]'
        );
        process.exit(1);
    }

    const manifestsByName = new Map();
    for (const dir of sourceDirs) {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('-mac.yml'));
        for (const file of files) {
            const list = manifestsByName.get(file) || [];
            list.push(path.join(dir, file));
            manifestsByName.set(file, list);
        }
    }

    if (manifestsByName.size === 0) {
        console.log('No *-mac.yml manifests found, nothing to merge.');
        return;
    }

    fs.mkdirSync(outDir, { recursive: true });

    for (const [name, manifestPaths] of manifestsByName) {
        const docs = manifestPaths.map((p) => yaml.load(fs.readFileSync(p, 'utf8')));

        const merged = { ...docs[0] };
        const seenUrls = new Set();
        merged.files = [];
        for (const doc of docs) {
            for (const file of doc.files || []) {
                if (!seenUrls.has(file.url)) {
                    seenUrls.add(file.url);
                    merged.files.push(file);
                }
            }
        }

        // Keep the deprecated top-level path/sha512 fields valid for older clients.
        const primary =
            merged.files.find((f) => f.url.endsWith('.zip')) || merged.files[0];
        if (primary) {
            merged.path = primary.url;
            merged.sha512 = primary.sha512;
        }

        const outPath = path.join(outDir, name);
        fs.writeFileSync(outPath, yaml.dump(merged));
        console.log(`Merged ${manifestPaths.length} manifest(s) into ${outPath}:`);
        for (const p of manifestPaths) {
            console.log(`  - ${p}`);
        }

        // Remove the sources so a later flatten/move of the source directories
        // doesn't overwrite the merged manifest with a single-arch one.
        for (const p of manifestPaths) {
            fs.unlinkSync(p);
        }
    }
}

main();
