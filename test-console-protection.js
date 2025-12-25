// Test file to demonstrate EnvSync console protection

console.log('=== EnvSync Console Protection Test ===\n');

// Test 1: Try to log individual secret
console.log('Test 1: Logging DATABASE_URL');
console.log('DATABASE_URL:', process.env.MONGO_URI);

// Test 2: Try to log entire process.env
console.log('\nTest 2: Logging entire process.env');
console.log(process.env);

// Test 3: Try to log secret in a string
console.log('\nTest 3: Secret in string');
console.log(`Connection string is: ${process.env.MONGO_URI}`);

// Test 4: Try to log multiple secrets
console.log('\nTest 4: Multiple secrets');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Test 5: Try to log object containing secrets
console.log('\nTest 5: Object with secrets');
const config = {
  database: process.env.MONGO_URI,
  jwt: process.env.JWT_SECRET,
  port: process.env.PORT
};
console.log('Config:', config);

// Test 6: Try console.info
console.log('\nTest 6: Using console.info');
console.info('Database:', process.env.MONGO_URI);

// Test 7: Try console.warn
console.log('\nTest 7: Using console.warn');
console.warn('Warning - JWT Secret:', process.env.JWT_SECRET);

console.log('\n=== Test Complete ===');
console.log('If protection is working, you should see [REDACTED] instead of actual secret values!');
