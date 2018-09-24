#!/usr/bin/env bash

ganache-cli &
echo $! > ganache-cli.pid
