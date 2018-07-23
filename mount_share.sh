#!/usr/bin/env bash
USER_NAME=$1
PASSWORD=$2
SHARE_DIR=$3
DIR_MOUNT=$4

#Mounting the share is a 2 stage process:
# 1. Create a directory that will be the mount point
# 2. Mount the share to that directory

#Create the mount point:
mkdir -p $DIR_MOUNT

echo "Copying files from mount directory $SHARE_DIR to mount location $DIR_MOUNT"

if mount | grep $DIR_MOUNT > /dev/null; then
	echo "Directory $DIR_MOUNT is already mounted so skipping mounting"
else
	#Mount the share:
	echo "Mounting $SHARE_DIR to $DIR_MOUNT"
	mount_smbfs //$USER_NAME:$PASSWORD@sfnas001.gid.gap.com/$SHARE_DIR $DIR_MOUNT/
fi




