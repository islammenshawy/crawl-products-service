#!/usr/bin/env bash

CATEGORY_ID=${1:-5664}
USER_NAME=${2:-username}
PASSWORD=${3:-password}
SHARE_DIR=${4:-Asset_Archive/GPWeb/content/0015/612/441/assets}
MOUNT_DIR=sfns_mount
CATG_FILE_NAME=categoryFilterList.json
PROD_FILE_NAME=prdList.json
PURGE_FILES=true

echo "copying product files for category: $CATEGORY_ID to mount $SHARE_DIR"
curl https://crawl-products-service.cfapps.io/category/$CATEGORY_ID > $CATG_FILE_NAME
curl https://crawl-products-service.cfapps.io/category/$CATEGORY_ID/products > $PROD_FILE_NAME

sh mount_share.sh $USER_NAME $PASSWORD $SHARE_DIR $MOUNT_DIR

cp $CATG_FILE_NAME sfns_mount/
cp $PROD_FILE_NAME sfns_mount/

#Unmount the share:
if mount | grep $MOUNT_DIR > /dev/null; then
	echo "Unmounting Dir $MOUNT_DIR"
	umount $MOUNT_DIR
fi

if $PURGE_FILES; then
	echo "purging temporary files and directories $CATG_FILE_NAME $PROD_FILE_NAME $MOUNT_DIR"
	rm $CATG_FILE_NAME
	rm $PROD_FILE_NAME
	rm -rd -f $MOUNT_DIR
fi
