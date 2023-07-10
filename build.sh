#!/bin/sh

set -ex
npm run build
mkdir -p bundle
cp icons/icon.ico bundle/icon.ico

# build current platform only, architecures of x64 and arm64

for arch in x64 arm64; do
    sh download-rclone.sh $RUNNER_OS $arch
    npm run dist -- --$arch
done
