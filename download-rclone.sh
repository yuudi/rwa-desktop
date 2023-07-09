#!/bin/sh

set -ex

platform=$1
arch=$2

exe="rclone"

case "$platform" in
"Linux")
    platform="linux"
    ;;
"macOS")
    platform="osx"
    ;;
"Windows")
    platform="windows"
    exe="rclone.exe"
    ;;
*)
    echo "Unknown platform: $platform"
    exit 1
    ;;
esac

case "$arch" in
"x64")
    arch="amd64"
    ;;
"arm64")
    arch="arm64"
    ;;
*)
    echo "Unknown arch: $arch"
    exit 1
    ;;
esac

mkdir -p tmp/download
cd tmp
rclone_exe_zip="rclone-${platform}-${arch}.zip"
if [ -f "download/$rclone_exe_zip" ]; then
    echo "rclone already downloaded"
else
    echo "downloading rclone"
    curl -sLo download/$rclone_exe_zip https://downloads.rclone.org/rclone-current-${platform}-${arch}.zip
fi
unzip download/$rclone_exe_zip
mv rclone-*-*/${exe} ../bundle/${exe}
rm -rf rclone*
