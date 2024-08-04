#!/bin/bash

echo "Testing valid JSON:"
npx ts-node src/json-parser.ts "$(cat tests/step1/valid.json)"
echo "Exit code: $?"

echo -e "\nTesting invalid JSON:"
npx ts-node src/json-parser.ts "$(cat tests/step1/invalid.json)"
echo "Exit code: $?"