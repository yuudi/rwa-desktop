#!/bin/sh

set -ex

# winfsp does not have arm64 support, so we use x64 instead
url="https://github.com/winfsp/winfsp/releases/download/v2.0/winfsp-2.0.23075.msi"

mkdir -p tmp/download
winfsp_msi="winfsp-2.0.23075.msi"
if [ -f "tmp/download/$winfsp_msi" ]; then
    echo "winfsp already downloaded"
else
    echo "downloading winfsp"
    curl -sLo tmp/download/$winfsp_msi $url
fi

mkdir -p build
cp windows-winfsp/installer.nsh build/installer.nsh
cp tmp/download/$winfsp_msi build/winfsp.msi
