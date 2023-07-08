#!/bin/sh

mkdir -p bundle release
for platform in linux darwin win32; do
    for arch in x64 arm64; do
        sh download-rclone.sh $platform $arch
        npm run make -- --platform=$platform --arch=$arch
        mv out/make/*/*Setup* release
        rm -rf out
        rm bundle/rclone*
    done
done
