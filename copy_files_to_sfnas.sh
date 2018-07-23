#!/usr/bin/env bash

CATEGORY_ID=${1:-5664}
USER_NAME=${2:-xnagrawa}
PASSWORD=${3:-Gapoldnavy12345}
SHARE_DIR=${4:-Asset_Archive/GPWeb/content/0015/612/441/assets}
MOUNT_DIR=sfns_mount

echo "copying product files for category: $CATEGORY_ID to mount $SHARE_DIR"
curl https://crawl-products-service.cfapps.io/category/$CATEGORY_ID > categoryFilterList.json
curl https://crawl-products-service.cfapps.io/category/$CATEGORY_ID/products > prdList.json

sh mount_share.sh xnagrawa Gapoldnavy12345 $SHARE_DIR $MOUNT_DIR

cp categoryFilterList.json sfns_mount/
cp prdList.json sfns_mount/

#Unmount the share:
if mount | grep $MOUNT_DIR > /dev/null; then
	echo "Unmounting Dir $MOUNT_DIR"
	#umount $MOUNT_DIR
fi
