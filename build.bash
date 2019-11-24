#!/usr/bin/env bash

# Copyright 2019 Koki Fukuda
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eu

if [ "$#" -ge 1 ] && [ "$1" = "--clean" ]; then
    rm -rf flood/ flood.tar.gz
    exit
fi

if [ -e flood ]; then
    echo "$0: Output directory existing"
    exit 1
fi

if [ -z "${CLOSURE_COMPILER:-}" ]; then
    echo "$0: CLOSURE_COMPILER is not set"
    exit 1
fi

mkdir flood
cp -r public/* flood/

for f in $(find flood/ -name '*.js'); do
    java -jar "$CLOSURE_COMPILER" -O ADVANCED --env BROWSER "$f" --js_output_file "${f%.js}.min.js"
    rm -f "$f"
done

for f in $(find flood/ -name '*.html'); do
    sed -i 's/\.js/\.min\.js/g' "$f"
done

tar -czvf flood.tar.gz flood/
