#!/usr/bin/env bash

set -e

test -z "$1" && echo Need version number && exit 1

IMAGE="blair-flask-app:$1"

docker build . -t $IMAGE 

docker tag  $IMAGE $REGISTRY.azurecr.io/$IMAGE
docker push        $REGISTRY.azurecr.io/$IMAGE
