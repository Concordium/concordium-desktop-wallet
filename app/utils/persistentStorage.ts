import storage from 'electron-json-storage';

function decodeData(data) {
    // TODO decrypt data
    return JSON.parse(data);
}

function encodeData(data) {
    // TODO encrypt data
    return JSON.stringify(data);
}

export async function load(key) {
    return new Promise(function (resolve, reject) {
        const raw = storage.get(key, function (err, data) {
            if (err !== undefined) {
                reject(err);
            } else {
                resolve(decodeData(data));
            }
        });
    });
}

export async function save(key, data) {
    storage.set(key, encodeData(data));
}
