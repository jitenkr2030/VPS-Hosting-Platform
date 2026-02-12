# Private Cloud-in-a-Box ISO Builder

## Overview
This directory contains the scripts and configurations needed to build a bootable ISO image for Private Cloud-in-a-Box deployment.

## Files
- `build-iso.sh` - Main ISO build script
- `config/` - Configuration files for the ISO
- `packages/` - Custom package definitions
- `preseed/` - Automated installation configurations

## Usage
```bash
sudo ./build-iso.sh
```

## Requirements
- Ubuntu 20.04+ build system
- Root privileges
- 10GB+ free disk space
- Internet connection for package downloads

## Output
- Bootable ISO file in `../iso-builds/`
- SHA256 and MD5 checksums
- Installation documentation