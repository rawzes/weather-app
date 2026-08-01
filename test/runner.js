const fs = require('fs');
const path = require('path');
const vm = require('vm');

const localStorageMock = (() => {
    const store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = String(value);
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            Object.keys(store).forEach(k => delete store[k]);
        }
    };
})();

// Set localStorage on global BEFORE running the script
global.localStorage = localStorageMock;

const scriptPath = path.join(__dirname, '..', 'weather-core.js');
const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
vm.runInThisContext(scriptCode);

const WeatherCore = global.WeatherCore;

let passed = 0;
let failed = 0;
let currentSuite = '';

function describe(name, fn) {
    currentSuite = name;
    fn();
    currentSuite = '';
}

function it(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${currentSuite} — ${name}`);
    } catch (error) {
        failed++;
        console.log(`  ✗ ${currentSuite} — ${name}`);
        console.log(`    ${error.message}`);
    }
}

const assert = {
    equal(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },
    deepEqual(actual, expected, message) {
        const aStr = JSON.stringify(actual);
        const eStr = JSON.stringify(expected);
        if (aStr !== eStr) {
            throw new Error(`${message || 'Assertion failed'}: expected ${eStr}, got ${aStr}`);
        }
    },
    truthy(value, message) {
        if (!value) {
            throw new Error(`${message || 'Assertion failed'}: expected truthy value, got ${JSON.stringify(value)}`);
        }
    },
    falsy(value, message) {
        if (value) {
            throw new Error(`${message || 'Assertion failed'}: expected falsy value, got ${JSON.stringify(value)}`);
        }
    },
    null(value, message) {
        if (value !== null) {
            throw new Error(`${message || 'Assertion failed'}: expected null, got ${JSON.stringify(value)}`);
        }
    },
    arrayContains(arr, item, message) {
        if (!arr.includes(item)) {
            throw new Error(`${message || 'Assertion failed'}: expected array to contain ${JSON.stringify(item)}, got ${JSON.stringify(arr)}`);
        }
    },
};

require('./weather-core.test.js')(WeatherCore, assert, { describe, it });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
