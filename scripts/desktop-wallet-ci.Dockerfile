# Installed dependencies:
#   - libudev-dev
#   - libusb-1.0-0-dev
#   - wasm-pack
#   - yarn
#   - node:${NODE_VERSION}

ARG BASE_VERSION
FROM concordium/base:${BASE_VERSION}

RUN apt-get update && apt-get install -y \
    libudev-dev \
    libusb-1.0-0-dev \
    rpm \
    awscli \
    sl
    
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Default value is set in Jenkinsfile
ARG NODE_VERSION
RUN . $NVM_DIR/nvm.sh \
    && nvm install ${NODE_VERSION} \
    && npm install --global yarn \
    && nvm use ${NODE_VERSION}

ENV PATH=$NVM_DIR/versions/node/v${NODE_VERSION}/bin:${PATH}
