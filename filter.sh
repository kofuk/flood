#!/usr/bin/env bash

cat $(ls -v | grep -v max) | tail -n +4 | awk -F, "\$6<=$1&&$1<=\$10&&\$5<=$2&&$2<=\$7{print \$3, \$4}"
