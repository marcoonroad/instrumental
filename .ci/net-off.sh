#!/usr/bin/env bash

kill $(cat ganache-cli.pid)
rm ganache-cli.pid
