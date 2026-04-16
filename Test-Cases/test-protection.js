const fs = require('fs');

console.log('--- EnvSync Protection Test ---');

// Test 1: Console.log
console.log('Testing console.log with MONGO_URI:', process.env.MONGO_URI || 'not set');

// Test 2: process.stdout.write
process.stdout.write('Testing process.stdout.write with MONGO_URI: ' + (process.env.MONGO_URI || 'not set') + '\n');

// Test 3: fs.writeFileSync
try {
    const filename = 'test-leak.txt';
    console.log(`Testing fs.writeFileSync to ${filename}...`);
    fs.writeFileSync(filename, `My secret is: ${process.env.MONGO_URI || 'not set'}`);
    const content = fs.readFileSync(filename, 'utf8');
    console.log('File content read back:', content);
    // fs.unlinkSync(filename); // Clean up
} catch (err) {
    console.error('File system test failed:', err.message);
}

console.log('--- Test Complete ---');
