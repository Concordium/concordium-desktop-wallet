pipeline {
    agent none
    environment {
        S3_BUCKET = 's3://desktopwallet.concordium.com'
    }
    stages {
        stage('precheck') {
            agent { label 'jenkins-worker' }
            steps {
                sh '''\
                    # Extract version number
                    VERSION=$(awk '/"version":/ { print substr($2, 2, length($2)-3); exit }' app/package.json)
                    FILENAME_DMG="concordium-wallet-${VERSION}.dmg"
                    
                    # Fail if file already exists
                    check_uniqueness() {
                        # Fail if file already exists
                        totalFoundObjects=$(aws s3 ls "${S3_BUCKET}/$1" --summarize | grep "Total Objects: " | sed 's/[^0-9]*//g')
                        if [ "$totalFoundObjects" -ne "0" ]; then
                            echo "${S3_BUCKET}/$1 already exists"
                            false
                        fi
                    }

                    check_uniqueness "${FILENAME_DMG}"
                '''.stripIndent()
            }
        }
        stage('build') {
            agent { label 'mac' }
            steps {
                sh '''\
                    # Print system info
                    node --version
                    npm --version
                    yarn --version
                    python --version
                    rustup show
                    wasm-pack --version

                    # Install dependencies
                    yarn

                    # Build
                    yarn package
                '''.stripIndent()
                stash includes: 'release/Concordium Wallet-*.dmg', name: 'releaseDMG'
            }
        }
        stage('Publish') {
            agent { label 'jenkins-worker' }
            steps {
                unstash 'releaseDMG'
                sh '''\
                    # Extract version number
                    VERSION=$(awk '/"version":/ { print substr($2, 2, length($2)-3); exit }' app/package.json)

                    #Prepare filenames
                    FILENAME_DMG="concordium-wallet-${VERSION}.dmg"
                    OUT_FILENAME_DMG="${FILENAME_DMG}/${VERSION}"
                    
                    # Push to s3
                    aws s3 cp "release/${FILENAME_DMG}" "${S3_BUCKET}/${OUT_FILENAME_DMG}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                '''.stripIndent()
            }
        }
    }
}
