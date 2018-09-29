#!/usr/bin/env bash

ganache-cli &> ganache-cli.log &
echo $! > ganache-cli.pid
