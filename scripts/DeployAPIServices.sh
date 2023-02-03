#!/usr/bin/env bash
cd /home/sunchuan/apps/314-automation
git switch main
git pull
chmod +x api.314.js

sudo su
cp api.314.service /etc/systemd/system/api.314.service
exit

systemctl start api.314