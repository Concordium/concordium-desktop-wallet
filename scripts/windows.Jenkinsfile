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
                    # Extract version number if not set as parameter
                    CARGO_VERSION=$(awk '/version = / { print substr($3, 2, length($3)-2); exit }' Cargo.toml)
                    [ -z "$VERSION" ] && VERSION=$CARGO_VERSION

                    # Prepare filenames
                    FILENAME_MSI="Concordium Wallet ${CARGO_VERSION}.msi"
                    OUT_FILENAME_MSI="${FILENAME_MSI/$CARGO_VERSION/$VERSION}"

                    FILENAME_EXE="Concordium Wallet Setup ${CARGO_VERSION}.exe"
                    OUT_FILENAME_EXE="${FILENAME_EXE/$CARGO_VERSION/$VERSION}"

                    check_uniqueness() {
                        # Fail if file already exists
                        totalFoundObjects=$(aws s3 ls "${S3_BUCKET}/$1" --summarize | grep "Total Objects: " | sed 's/[^0-9]*//g')
                        if [ "$totalFoundObjects" -ne "0" ]; then
                            echo "${S3_BUCKET}/$1 already exists"
                            false
                        fi
                    }
                    
                    check_uniqueness "${OUT_FILENAME_MSI}"
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
                    aws s3 cp "release/${FILENAME_MSI}" "${S3_BUCKET}/${OUT_FILENAME_MSI}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                    aws s3 cp "release/${FILENAME_EXE}" "${S3_BUCKET}/${OUT_FILENAME_EXE}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                '''.stripIndent()
            }
        }
    }
}
