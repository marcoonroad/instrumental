#!/usr/bin/env bash

function plot {
  IMAGE=`echo $1 | sed s/sol/png/`
  cat $1 | solgraph | dot -Tpng -o $IMAGE
}

cd contracts
for CONTRACT in `ls *.sol`
do
  plot $CONTRACT
done
mv *.png ../docs/images/
cd ..
