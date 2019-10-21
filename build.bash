#!/usr/bin/env bash
set -eu

if [ "$1" = "--clean" ]; then
    rm -rf flood/ flood.tar.gz
    exit
fi

if [ -e flood ]; then
    echo "$0: Output directory existing"
    exit 1
fi

if [ -z "$CLOSURE_COMPILER" ]; then
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
