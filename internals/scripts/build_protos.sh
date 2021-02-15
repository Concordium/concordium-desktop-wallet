#!/bin/bash

BASEDIR=$(dirname "$0")
cd ${BASEDIR}/../../

PROTO_SOURCE_DIR=deps/grpc-api
PROTO_DEST=./app/proto
PROTO_WIN_DEST=app/proto

mkdir -p ${PROTO_DEST}

if  [ "$(uname)" = "Darwin" ] || [ "$(uname)" = "Linux" ]
then
    # JavaScript code generation
    yarn run grpc_tools_node_protoc \
         --js_out=import_style=commonjs,binary:${PROTO_DEST} \
         --grpc_out=grpc_js:${PROTO_DEST} \
         --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
         -I ./${PROTO_SOURCE_DIR} ${PROTO_SOURCE_DIR}/*.proto

    # TypeScript code generation
    yarn run grpc_tools_node_protoc \
         --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
         --ts_out=${PROTO_DEST} \
         -I ./${PROTO_SOURCE_DIR} ${PROTO_SOURCE_DIR}/*.proto
else
    # JavaScript code generation
    yarn run grpc_tools_node_protoc \
         --js_out=import_style=commonjs,binary:${PROTO_WIN_DEST} \
         --grpc_out=grpc_js:${PROTO_WIN_DEST} \
         -I ./${PROTO_SOURCE_DIR} ${PROTO_SOURCE_DIR}/*.proto

    # TypeScript code generation
    yarn run grpc_tools_node_protoc \
         --ts_out=${PROTO_WIN_DEST} \
         -I ./${PROTO_SOURCE_DIR} ${PROTO_SOURCE_DIR}/*.proto
fi
