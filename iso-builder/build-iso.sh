#!/bin/bash

# =============================================================================
# Private Cloud-in-a-Box ISO Builder
# =============================================================================
# This script creates a bootable ISO image for Private Cloud deployment
# Based on Ubuntu 22.04 LTS with custom configurations and packages
# =============================================================================

set -e

# Configuration
ISO_NAME="private-cloud-in-a-box"
VERSION="1.0.0"
BUILD_DIR="/tmp/${ISO_NAME}-build"
MOUNT_POINT="/tmp/${ISO_NAME}-mount"
OUTPUT_DIR="./iso-builds"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Install required packages
install_dependencies() {
    log "Installing dependencies..."
    apt-get update
    apt-get install -y \
        debootstrap \
        squashfs-tools \
        xorriso \
        grub-pc-bin \
        grub-efi-amd64-bin \
        mtools \
        dosfstools \
        isolinux \
        syslinux-utils \
        genisoimage \
        wget \
        curl \
        gnupg \
        software-properties-common \
        apt-mirror \
        docker.io \
        qemu-kvm \
        libvirt-daemon-system \
        libvirt-clients \
        bridge-utils
}

# Create build directory structure
create_directories() {
    log "Creating build directory structure..."
    rm -rf "$BUILD_DIR" "$MOUNT_POINT"
    mkdir -p "$BUILD_DIR" "$MOUNT_POINT" "$OUTPUT_DIR"
    
    # Create chroot directory
    mkdir -p "$BUILD_DIR/chroot"
    
    # Create ISO structure
    mkdir -p "$BUILD_DIR/iso/{casper,isolinux,preseed,boot/grub}"
}

# Bootstrap Ubuntu base system
bootstrap_system() {
    log "Bootstrapping Ubuntu 22.04 LTS base system..."
    debootstrap \
        --arch=amd64 \
        --variant=minbase \
        --include=systemd,systemd-sysv,ubuntu-minimal \
        jammy \
        "$BUILD_DIR/chroot" \
        http://archive.ubuntu.com/ubuntu/
}

# Configure system
configure_system() {
    log "Configuring system..."
    
    # Mount necessary filesystems
    mount -t proc none "$BUILD_DIR/chroot/proc"
    mount -t sysfs none "$BUILD_DIR/chroot/sys"
    mount -t devtmpfs none "$BUILD_DIR/chroot/dev"
    mount -t devpts none "$BUILD_DIR/chroot/dev/pts"
    
    # Create sources.list
    cat > "$BUILD_DIR/chroot/etc/apt/sources.list" << EOF
deb http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse
EOF
    
    # Set hostname
    echo "private-cloud" > "$BUILD_DIR/chroot/etc/hostname"
    
    # Configure hosts
    cat > "$BUILD_DIR/chroot/etc/hosts" << EOF
127.0.0.1   localhost
127.0.1.1   private-cloud.localdomain private-cloud

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
EOF
    
    # Configure network
    cat > "$BUILD_DIR/chroot/etc/netplan/01-private-cloud.yaml" << EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: true
      optional: true
EOF
    
    # Create fstab
    cat > "$BUILD_DIR/chroot/etc/fstab" << EOF
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
UUID=ROOT_UUID   /               ext4    errors=remount-ro 0       1
UUID=SWAP_UUID   none            swap    sw              0       0
EOF
}

# Install packages
install_packages() {
    log "Installing packages..."
    
    chroot "$BUILD_DIR/chroot" /bin/bash -c "
        export DEBIAN_FRONTEND=noninteractive
        apt-get update
        apt-get install -y \\
            linux-image-generic \\
            grub-pc \\
            cloud-init \\
            netplan.io \\
            openssh-server \\
            sudo \\
            curl \\
            wget \\
            htop \\
            nano \\
            vim \\
            git \\
            docker.io \\
            docker-compose \\
            qemu-kvm \\
            libvirt-daemon-system \\
            libvirt-clients \\
            bridge-utils \\
            cpu-checker \\
            software-properties-common \\
            apt-transport-https \\
            ca-certificates \\
            gnupg \\
            lsb-release \\
            python3 \\
            python3-pip \\
            nodejs \\
            npm \\
            nginx \\
            postgresql \\
            redis-server \\
            haproxy \\
            prometheus \\
            grafana \\
            elasticsearch \\
            logstash \\
            kibana \\
            filebeat \\
            metricbeat \\
            auditd \\
            rkhunter \\
            lynis \\
            chkrootkit \\
            ufw \\
            fail2ban \\
            apparmor \\
            selinux-utils
    "
}

# Install Private Cloud components
install_private_cloud() {
    log "Installing Private Cloud components..."
    
    # Create private-cloud user
    chroot "$BUILD_DIR/chroot" /bin/bash -c "
        useradd -m -s /bin/bash private-cloud
        usermod -aG sudo,docker,libvirt private-cloud
        echo 'private-cloud:private-cloud' | chpasswd
    "
    
    # Create application directory
    mkdir -p "$BUILD_DIR/chroot/opt/private-cloud"
    
    # Copy application files (assuming they exist in ./private-cloud-app)
    if [ -d "./private-cloud-app" ]; then
        cp -r ./private-cloud-app/* "$BUILD_DIR/chroot/opt/private-cloud/"
    fi
    
    # Create systemd services
    mkdir -p "$BUILD_DIR/chroot/etc/systemd/system"
    
    # Private Cloud Dashboard Service
    cat > "$BUILD_DIR/chroot/etc/systemd/system/private-cloud-dashboard.service" << EOF
[Unit]
Description=Private Cloud Dashboard
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=private-cloud
WorkingDirectory=/opt/private-cloud/dashboard
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Private Cloud API Service
    cat > "$BUILD_DIR/chroot/etc/systemd/system/private-cloud-api.service" << EOF
[Unit]
Description=Private Cloud API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=private-cloud
WorkingDirectory=/opt/private-cloud/api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable services
    chroot "$BUILD_DIR/chroot" /bin/bash -c "
        systemctl enable private-cloud-dashboard
        systemctl enable private-cloud-api
        systemctl enable docker
        systemctl enable libvirtd
        systemctl enable postgresql
        systemctl enable redis-server
        systemctl enable nginx
        systemctl enable ufw
        systemctl enable fail2ban
    "
}

# Configure security
configure_security() {
    log "Configuring security..."
    
    # Configure UFW firewall
    cat > "$BUILD_DIR/chroot/etc/ufw/rules.d/99-private-cloud.rules" << EOF
# Private Cloud Firewall Rules
# Allow SSH
-A ufw-before-input -p tcp --dport 22 -j ACCEPT
# Allow HTTP/HTTPS
-A ufw-before-input -p tcp --dport 80 -j ACCEPT
-A ufw-before-input -p tcp --dport 443 -j ACCEPT
# Allow Private Cloud Dashboard
-A ufw-before-input -p tcp --dport 3000 -j ACCEPT
# Allow Private Cloud API
-A ufw-before-input -p tcp --dport 3001 -j ACCEPT
# Allow Libvirt
-A ufw-before-input -p tcp --dport 16509 -j ACCEPT
# Allow KVM Migration
-A ufw-before-input -p tcp --dport 49152:49215 -j ACCEPT
EOF
    
    # Configure SSH
    cat > "$BUILD_DIR/chroot/etc/ssh/sshd_config.d/99-private-cloud.conf" << EOF
# Private Cloud SSH Configuration
Port 22
Protocol 2
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF
    
    # Configure auditd
    cat > "$BUILD_DIR/chroot/etc/audit/rules.d/99-private-cloud.rules" << EOF
# Private Cloud Audit Rules
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
-w /var/log/audit/ -p wa -k audit_logs
-w /opt/private-cloud/ -p wa -k private_cloud
EOF
}

# Create preseed file for automated installation
create_preseed() {
    log "Creating preseed file..."
    
    cat > "$BUILD_DIR/iso/preseed/private-cloud.seed" << EOF
# Private Cloud-in-a-Box Preseed File

# Localization
d-i debian-installer/locale string en_US.UTF-8
d-i console-setup/ask_detect boolean false
d-i keyboard-configuration/xkb-keymap select us

# Network configuration
d-i netcfg/choose_interface select auto
d-i netcfg/get_hostname string private-cloud
d-i netcfg/get_domain string localdomain
d-i netcfg/wireless_wep string

# Mirror configuration
d-i mirror/country string manual
d-i mirror/http/hostname string archive.ubuntu.com
d-i mirror/http/directory string /ubuntu/
d-i mirror/http/proxy string

# Account setup
d-i passwd/user-fullname string Private Cloud Administrator
d-i passwd/username string admin
d-i passwd/user-password password admin123
d-i passwd/user-password-again password admin123
d-i passwd/root-login boolean false
d-i passwd/make-user boolean true

# Clock and time zone setup
d-i time/zone string UTC
d-i clock-setup/utc boolean true

# Partitioning
d-i partman-auto/method string lvm
d-i partman-lvm/device_remove_lvm boolean true
d-i partman-md/device_remove_md boolean true
d-i partman-lvm/confirm boolean true
d-i partman-lvm/confirm_nooverwrite boolean true
d-i partman-auto/choose_recipe select atomic
d-i partman-partitioning/confirm_write_new_label boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true

# Base system installation
d-i base-installer/kernel/image string linux-generic

# Boot loader installation
d-i grub-installer/only_debian boolean true
d-i grub-installer/with_other_os boolean true

# Package selection
tasksel tasksel/first multiselect standard, server
d-i pkgsel/include string openssh-server build-essential
d-i pkgsel/upgrade select full-upgrade
d-i pkgsel/update-policy select unattended-upgrades
popularity-contest popularity-contest/participate boolean false

# Finish installation
d-i finish-install/reboot_in_progress note
d-i cdrom-detect/eject boolean true
d-i debian-installer/exit/halt boolean false
EOF
}

# Create bootloader configuration
create_bootloader() {
    log "Creating bootloader configuration..."
    
    # ISOLINUX configuration
    cat > "$BUILD_DIR/iso/isolinux/isolinux.cfg" << EOF
default private-cloud
timeout 50
prompt 1
display boot.txt

label private-cloud
  menu label ^Install Private Cloud-in-a-Box
  kernel /casper/vmlinuz
  append  file=/cdrom/preseed/private-cloud.seed boot=casper initrd=/casper/initrd quiet splash --

label check
  menu label ^Check disc for defects
  kernel /casper/vmlinuz
  append  boot=casper integrity-check initrd=/casper/initrd quiet splash --

label memtest
  menu label Test ^memory
  kernel /install/memtest86+

label hd
  menu label ^Boot from first hard disk
  localboot 0x80
EOF
    
    # Boot menu text
    cat > "$BUILD_DIR/iso/isolinux/boot.txt" << EOF
  Private Cloud-in-a-Box v${VERSION}
  
  Install Private Cloud-in-a-Box
  
  Press ENTER to begin installation
EOF
    
    # GRUB configuration
    cat > "$BUILD_DIR/iso/boot/grub/grub.cfg" << EOF
set default="0"
set timeout=10

menuentry "Install Private Cloud-in-a-Box" {
    linux /casper/vmlinuz file=/cdrom/preseed/private-cloud.seed boot=casper quiet splash ---
    initrd /casper/initrd
}

menuentry "Check disc for defects" {
    linux /casper/vmlinuz boot=casper integrity-check quiet splash ---
    initrd /casper/initrd
}

menuentry "Memory test (memtest86+)" {
    linux /install/memtest86+
}
EOF
}

# Create squashfs filesystem
create_squashfs() {
    log "Creating squashfs filesystem..."
    
    # Clean up chroot
    chroot "$BUILD_DIR/chroot" /bin/bash -c "
        apt-get clean
        rm -rf /tmp/*
        rm -rf /var/tmp/*
        rm -rf /var/log/*
        rm -rf /var/cache/apt/archives/*.deb
        rm -rf /root/.bash_history
        history -c
    "
    
    # Unmount filesystems
    umount "$BUILD_DIR/chroot/proc" || true
    umount "$BUILD_DIR/chroot/sys" || true
    umount "$BUILD_DIR/chroot/dev/pts" || true
    umount "$BUILD_DIR/chroot/dev" || true
    
    # Create squashfs
    mksquashfs "$BUILD_DIR/chroot" "$BUILD_DIR/iso/casper/filesystem.squashfs" \
        -e boot -comp xz -Xbcj x86 -b 1M -Xdict-size 1M
    
    # Create filesystem size file
    du -sx --block-size=1 "$BUILD_DIR/chroot" > "$BUILD_DIR/iso/casper/filesystem.size"
}

# Create boot files
create_boot_files() {
    log "Creating boot files..."
    
    # Extract kernel and initrd from chroot
    cp "$BUILD_DIR/chroot/boot/vmlinuz-"* "$BUILD_DIR/iso/casper/vmlinuz"
    cp "$BUILD_DIR/chroot/boot/initrd.img-"* "$BUILD_DIR/iso/casper/initrd"
    
    # Copy ISOLINUX files
    cp /usr/lib/ISOLINUX/isolinux.bin "$BUILD_DIR/iso/isolinux/"
    cp /usr/lib/syslinux/modules/bios/ldlinux.c32 "$BUILD_DIR/iso/isolinux/"
    
    # Copy GRUB files
    cp /usr/lib/grub/x86_64-efi-signed/bootx64.efi.signed "$BUILD_DIR/iso/boot/grub/bootx64.efi"
    cp /usr/lib/grub/x86_64-efi-signed/grubx64.efi.signed "$BUILD_DIR/iso/boot/grub/grubx64.efi"
}

# Create ISO image
create_iso() {
    log "Creating ISO image..."
    
    # Create disk defines
    cat > "$BUILD_DIR/iso/README.diskdefines" << EOF
#define DISKNAME  Private Cloud-in-a-Box ${VERSION}
#define TYPE  binary
#define TYPEbinary  1
#define ARCH  amd64
#define ARCHamd64  1
#define DISKNUM  1
#define DISKNUM1  1
#define TOTALNUM  0
#define TOTALNUM0  1
EOF
    
    # Create ISO
    cd "$BUILD_DIR/iso"
    xorriso -as mkisofs \
        -iso-level 3 \
        -full-iso9660-filenames \
        -volid "PrivateCloudBox" \
        -appid "Private Cloud-in-a-Box ${VERSION}" \
        -publisher "Private Cloud Solutions" \
        -preparer "Private Cloud Build System" \
        -eltorito-boot isolinux/isolinux.bin \
        -eltorito-catalog isolinux/boot.cat \
        -no-emul-boot -boot-load-size 4 -boot-info-table \
        -eltorito-alt-boot -e boot/grub/efiboot.img -no-emul-boot \
        -isohybrid-gpt-basdat -output "$OUTPUT_DIR/${ISO_NAME}-${VERSION}.iso" \
        .
    
    cd - > /dev/null
}

# Generate checksums
generate_checksums() {
    log "Generating checksums..."
    
    cd "$OUTPUT_DIR"
    sha256sum "${ISO_NAME}-${VERSION}.iso" > "${ISO_NAME}-${VERSION}.iso.sha256"
    md5sum "${ISO_NAME}-${VERSION}.iso" > "${ISO_NAME}-${VERSION}.iso.md5"
    cd - > /dev/null
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    umount "$BUILD_DIR/chroot/proc" || true
    umount "$BUILD_DIR/chroot/sys" || true
    umount "$BUILD_DIR/chroot/dev/pts" || true
    umount "$BUILD_DIR/chroot/dev" || true
    umount "$MOUNT_POINT" || true
    rm -rf "$BUILD_DIR" "$MOUNT_POINT"
}

# Main function
main() {
    log "Starting Private Cloud-in-a-Box ISO build process..."
    
    check_root
    install_dependencies
    create_directories
    bootstrap_system
    configure_system
    install_packages
    install_private_cloud
    configure_security
    create_preseed
    create_bootloader
    create_squashfs
    create_boot_files
    create_iso
    generate_checksums
    cleanup
    
    log "ISO build completed successfully!"
    log "ISO file: $OUTPUT_DIR/${ISO_NAME}-${VERSION}.iso"
    log "SHA256: $(cat $OUTPUT_DIR/${ISO_NAME}-${VERSION}.iso.sha256)"
    
    # Display file information
    ls -lh "$OUTPUT_DIR/${ISO_NAME}-${VERSION}.iso"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"