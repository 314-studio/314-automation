#!/usr/bin/env bash
sudo su
cp /etc/letsencrypt/live/314studio.games/fullchain.pem /home/sunchuan/apps/certs/fullchain.pem
cp /etc/letsencrypt/live/314studio.games/privkey.pem /home/sunchuan/apps/certs/privkey.pem
cp /etc/letsencrypt/live/314studio.games/chain.pem /home/sunchuan/apps/certs/chain.pem
cp /etc/letsencrypt/live/314studio.games/cert.pem /home/sunchuan/apps/certs/cert.pem
exit
