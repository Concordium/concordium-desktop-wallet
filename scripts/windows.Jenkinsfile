pipeline {
    agent none
    environment {
        S3_BUCKET = 's3://desktopwallet.concordium.com'
    }
    stages {
        stage('build') {
            agent { label 'windows' }
            steps {
                sh '''\
                    # Extract version number
                    VERSION=$(awk '/"version":/ { print substr($2, 2, length($2)-3); exit }' app/package.json)
                    
                    FILENAME_EXE="concordium-wallet-${VERSION}.exe"
                    OUT_FILENAME_EXE="${VERSION}/${FILENAME_EXE}"

                    check_uniqueness() {
                        # Fail if file already exists
                        totalFoundObjects=$(aws s3 ls "${S3_BUCKET}/$1" --summarize | grep "Total Objects: " | sed 's/[^0-9]*//g')
                        if [ "$totalFoundObjects" -ne "0" ]; then
                            echo "${S3_BUCKET}/$1 already exists"
                            false
                        fi
                    }
                    
                    check_uniqueness "${OUT_FILENAME_EXE}"

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

                    # Push to s3
                    aws s3 cp "release/${FILENAME_EXE}" "${S3_BUCKET}/${OUT_FILENAME_EXE}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                '''.stripIndent()
            }
        }
    }
}
