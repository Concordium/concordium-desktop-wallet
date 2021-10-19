pipeline {
    agent none
    environment {
        S3_BUCKET = 's3://desktopwallet.concordium.com'
    }
    stages {
        stage('ecr-login') {
            agent { label 'jenkins-worker' }
            steps {
                sh 'aws ecr get-login-password \
                        --region eu-west-1 \
                    | docker login \
                        --username AWS \
                        --password-stdin 192549843005.dkr.ecr.eu-west-1.amazonaws.com'
            }
        }
        stage('precheck') {
            agent { label 'jenkins-worker' }
            steps {
                sh '''\
                    # Extract version number
                    VERSION=$(awk '/"version":/ { print substr($2, 2, length($2)-3); exit }' app/package.json)

                    # Prepare filenames
                    if [[ $TARGET_NET = "mainnet" ]]; then
                       FILENAME_DEB="concordium-desktop-wallet-${VERSION}.deb"
                       FILENAME_RPM="concordium-desktop-wallet-${VERSION}.rpm"
                       FILENAME_APPIMAGE="concordium-desktop-wallet-${VERSION}.AppImage"
                       export TARGET_NET=
                    else
                       FILENAME_DEB="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.deb"
                       FILENAME_RPM="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.rpm"
                       FILENAME_APPIMAGE="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.AppImage"
                    fi

                    OUT_FILENAME_DEB="${VERSION}/${FILENAME_DEB}"

                    OUT_FILENAME_RPM="${VERSION}/${FILENAME_RPM}"

                    OUT_FILENAME_APPIMAGE="${VERSION}/${FILENAME_APPIMAGE}"

                    OUT_LATEST_LINUX="${VERSION}/latest-linux.yml"

                    check_uniqueness() {
                        # Fail if file already exists
                        totalFoundObjects=$(aws s3 ls "${S3_BUCKET}/$1" --summarize | grep "Total Objects: " | sed 's/[^0-9]*//g')
                        if [ "$totalFoundObjects" -ne "0" ]; then
                            echo "${S3_BUCKET}/$1 already exists"
                            false
                        fi
                    }
                    
                    check_uniqueness "${OUT_FILENAME_DEB}"
                    check_uniqueness "${OUT_FILENAME_RPM}"
                    check_uniqueness "${OUT_FILENAME_APPIMAGE}"
                    check_uniqueness "${OUT_LATEST_LINUX}"
                '''.stripIndent()
            }
        }
        stage('build') {
            agent { 
                docker {
                    label 'jenkins-worker'
                    image 'concordium/desktop-wallet-ci:latest' 
                    registryUrl 'https://192549843005.dkr.ecr.eu-west-1.amazonaws.com/'
                    args '-u root'
                } 
            }
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
                stash includes: 'release/**/*', name: 'release'
            }
            post {
                cleanup {
                    sh '''\
                        # Docker image has to run as root, otherwise user dosen't have access to node
                        # this means all generated files a owned by root, in workdir mounted from host
                        # meaning jenkins can't clean the files, so set owner of all files to jenkins
                        chown -R 1000:1000 .
                    '''.stripIndent()
                }
            }
        }
        stage('Publish') {
            agent { label 'jenkins-worker' }
            steps {
                unstash 'release'
                sh '''\
                    # Extract version number
                    VERSION=$(awk '/"version":/ { print substr($2, 2, length($2)-3); exit }' app/package.json)
                    
                    # Prepare filenames
                    if [[ $TARGET_NET = "mainnet" ]]; then
                       FILENAME_DEB="concordium-desktop-wallet-${VERSION}.deb"
                       FILENAME_RPM="concordium-desktop-wallet-${VERSION}.rpm"
                       FILENAME_APPIMAGE="concordium-desktop-wallet-${VERSION}.AppImage"
                    else
                       FILENAME_DEB="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.deb"
                       FILENAME_RPM="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.rpm"
                       FILENAME_APPIMAGE="concordium-desktop-wallet-${TARGET_NET}-${VERSION}.AppImage"
                    fi

                    FILENAME_LATEST_LINUX="latest-linux.yml"

                    OUT_FILENAME_DEB="${VERSION}/${TARGET_NET}/${FILENAME_DEB}"
                    OUT_FILENAME_RPM="${VERSION}/${TARGET_NET}/${FILENAME_RPM}"
                    OUT_FILENAME_APPIMAGE="${VERSION}/${TARGET_NET}/${FILENAME_APPIMAGE}"
                    OUT_LATEST_LINUX="${VERSION}/${TARGET_NET}/latest-linux.yml"
                    
                    # Push to s3
                    aws s3 cp "release/${FILENAME_DEB}" "${S3_BUCKET}/${OUT_FILENAME_DEB}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                    aws s3 cp "release/${FILENAME_RPM}" "${S3_BUCKET}/${OUT_FILENAME_RPM}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                    aws s3 cp "release/${FILENAME_APPIMAGE}" "${S3_BUCKET}/${OUT_FILENAME_APPIMAGE}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                    aws s3 cp "release/${FILENAME_LATEST_LINUX}" "${S3_BUCKET}/${OUT_LATEST_LINUX}" --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
                '''.stripIndent()
            }
        }
    }
}
