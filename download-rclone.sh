#!/bin/sh

platform=$1
arch=$2

exe="rclone"

case "$platform" in
"linux")
    platform="linux"
    ;;
"darwin")
    platform="osx"
    ;;
"win32")
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

mkdir -p tmp
cd tmp
wget -O rclone.zip https://downloads.rclone.org/rclone-current-${platform}-${arch}.zip
unzip rclone.zip
mv rclone-*-*/${exe} ../bundle/${exe}
rm -rf *
