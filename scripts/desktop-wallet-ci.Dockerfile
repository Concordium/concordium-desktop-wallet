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
    build-essential \
    patchelf \
    wget \
    libssl-dev

# Manually install libssl1.1 (needed on Ubuntu 22.04+)
RUN dpkg -s libssl1.1 || ( \
    wget http://security.ubuntu.com/ubuntu/pool/main/o/openssl1.1/libssl1.1_1.1.1f-1ubuntu2.19_amd64.deb && \
    dpkg -i libssl1.1_1.1.1f-1ubuntu2.19_amd64.deb && \
    rm libssl1.1_1.1.1f-1ubuntu2.19_amd64.deb \
)

    
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Default value is set in Github Actions
ARG NODE_VERSION
RUN . $NVM_DIR/nvm.sh \
    && nvm install ${NODE_VERSION} \
    && nvm use ${NODE_VERSION}

ENV PATH=$NVM_DIR/versions/node/v${NODE_VERSION}/bin:${PATH}
