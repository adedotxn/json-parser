import fs from 'fs';
import path from 'path';
import { parseJSON } from "./src/json-parser";

const testDirectory = './tests/__test__'


function runTests() {
    const files = fs.readdirSync(testDirectory);
    let passCount = 0;
    let failCount = 0;

    files.forEach(file => {
        if (!file.endsWith('.json')) return; // Skip non-JSON files

        const filePath = path.join(testDirectory, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const expectedResult = file.startsWith('pass');

        try {
            const result = parseJSON(content);
            if (result === expectedResult) {
                console.log(`✅ PASS: ${file}`);
                passCount++;
            } else {
                console.log(`❌ FAIL: ${file} (Expected ${expectedResult}, got ${result})`);
                failCount++;
            }
        } catch (error) {
            if (!expectedResult) {
                console.log(`✅ PASS: ${file} (Expected invalid JSON)`);
                passCount++;
            } else {
                console.log(`❌ FAIL: ${file} (Unexpected error: ${error})`);
                failCount++;
            }
        }
    });

    return { passCount, failCount };
}

console.log("Running JSON.org test suite:");
const results = runTests();

const totalTests = results.passCount + results.failCount;

console.log(`\nTest Results:`);
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${results.passCount}`);
console.log(`Failed: ${results.failCount}`);
console.log(`Pass rate: ${(results.passCount / totalTests * 100).toFixed(2)}%`);