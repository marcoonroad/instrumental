#!/usr/bin/env bash

function plot {
  IMAGE=$(echo "${1//sol/png}")
  solgraph < $1 | dot -Tpng -o $IMAGE
}

cd contracts
for CONTRACT in $(ls *.sol)
do
  plot $CONTRACT
done
mv *.png ../docs/images/
cd ..
