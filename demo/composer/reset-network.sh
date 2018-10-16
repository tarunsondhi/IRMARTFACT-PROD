#!/bin/bash

echo "let's reset the network"

sh ~/Dev/fabric-dev-servers/stopFabric.sh
sh ~/Dev/fabric-dev-servers/teardownFabric.sh

docker container prune -f

echo "\nNETWORK TORN DOWN!---------------------------------\n"

sh ~/Dev/fabric-dev-servers/startFabric.sh
sh ~/Dev/fabric-dev-servers/createPeerAdminCard.sh

echo "\nNETWORK READY!-------------------------------------\n"
