// EnvSync Console and File System Protection Module
const fs = require('fs');
const http = require('http');
const https = require('https');

const ENVSYNC_SECRET_KEYS = process.env.ENVSYNC_SECRET_KEYS ? JSON.parse(process.env.ENVSYNC_SECRET_KEYS) : [];
const ENVSYNC_SECRET_VALUES = process.env.ENVSYNC_SECRET_VALUES ? JSON.parse(process.env.ENVSYNC_SECRET_VALUES) : [];
const ENVSYNC_API_TOKEN = process.env.ENVSYNC_API_TOKEN;
const ENVSYNC_BASE_URL = process.env.ENVSYNC_BASE_URL;
const ENVSYNC_PROJECT_ID = process.env.ENVSYNC_PROJECT_ID;
const ENVSYNC_ENVIRONMENT = process.env.ENVSYNC_ENVIRONMENT;

// Store original methods
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;
const originalDebug = console.debug;
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

const originalFsWriteFile = fs.writeFile;
const originalFsWriteFileSync = fs.writeFileSync;
const originalFsAppendFile = fs.appendFile;
const originalFsAppendFileSync = fs.appendFileSync;

// Create Set for faster lookup
const secretValueSet = new Set(ENVSYNC_SECRET_VALUES.filter(v => v && v.length > 3));

/**
 * Report a leak attempt to the backend (Async & Safe)
 */
function reportLeak(method) {
  if (!ENVSYNC_API_TOKEN || !ENVSYNC_BASE_URL) return;
  
  const payload = JSON.stringify({
    details: `Redacted secret from ${method}`,
    projectId: ENVSYNC_PROJECT_ID,
    environment: ENVSYNC_ENVIRONMENT
  });

  try {
    const url = new URL(`${ENVSYNC_BASE_URL}/audit/report-leak`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENVSYNC_API_TOKEN}`,
        'Content-Length': Buffer.from(payload).length
      },
      timeout: 2000
    });
    
    req.on('error', () => {}); 
    req.write(payload);
    req.end();
  } catch (e) { }
}

/**
 * Base Redaction Core
 */
function redactString(str) {
  if (typeof str !== 'string') return { str, leaked: false };
  let redacted = str;
  let leaked = false;

  secretValueSet.forEach(value => {
    if (redacted.includes(value)) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      redacted = redacted.replace(new RegExp(escaped, 'g'), '[REDACTED]');
      leaked = true;
    }
  });

  return { str: redacted, leaked };
}

/**
 * Deep Redaction for Objects (Safe from Circular References)
 */
function redactObject(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return { obj, leaked: false };
  if (seen.has(obj)) return { obj, leaked: false };
  
  seen.add(obj);
  let anyLeaked = false;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 1. Check Key
      if (ENVSYNC_SECRET_KEYS.includes(key)) {
        obj[key] = '[REDACTED]';
        anyLeaked = true;
      } 
      // 2. Check String Value
      else if (typeof obj[key] === 'string') {
        const { str, leaked } = redactString(obj[key]);
        if (leaked) {
          obj[key] = str;
          anyLeaked = true;
        }
      } 
      // 3. Recursive Check
      else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const { leaked } = redactObject(obj[key], seen);
        if (leaked) anyLeaked = true;
      }
    }
  }
  return { obj, leaked: anyLeaked };
}

/**
 * Main arguments processor
 */
function processArgs(args, method) {
  let anyLeaked = false;
  const processed = args.map(arg => {
    if (typeof arg === 'string') {
      const { str, leaked } = redactString(arg);
      if (leaked) anyLeaked = true;
      return str;
    }
    if (typeof arg === 'object' && arg !== null) {
      const { leaked } = redactObject(arg);
      if (leaked) anyLeaked = true;
      return arg; // In-place modification
    }
    return arg;
  });

  if (anyLeaked) reportLeak(method);
  return processed;
}

// Global Hooking
console.log = (...args) => originalLog.apply(console, processArgs(args, 'console.log'));
console.info = (...args) => originalInfo.apply(console, processArgs(args, 'console.info'));
console.warn = (...args) => originalWarn.apply(console, processArgs(args, 'console.warn'));
console.error = (...args) => originalError.apply(console, processArgs(args, 'console.error'));

process.stdout.write = function(chunk, encoding, callback) {
  if (typeof chunk === 'string') {
    const { str, leaked } = redactString(chunk);
    if (leaked) reportLeak('stdout.write');
    return originalStdoutWrite.call(process.stdout, str, encoding, callback);
  }
  return originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
};

fs.writeFile = function(path, data, options, callback) {
  let finalData = data;
  if (typeof data === 'string') {
    const { str, leaked } = redactString(data);
    if (leaked) reportLeak('fs.writeFile');
    finalData = str;
  }
  return originalFsWriteFile.call(fs, path, finalData, options, callback);
};

fs.writeFileSync = function(path, data, options) {
  let finalData = data;
  if (typeof data === 'string') {
    const { str, leaked } = redactString(data);
    if (leaked) reportLeak('fs.writeFileSync');
    finalData = str;
  }
  return originalFsWriteFileSync.call(fs, path, finalData, options);
};

// Activation Log
originalInfo.call(console, '\x1b[33m🔒 [EnvSync] Security Shield Active\x1b[0m');

// Cleanup
delete process.env.ENVSYNC_SECRET_KEYS;
delete process.env.ENVSYNC_SECRET_VALUES;
delete process.env.ENVSYNC_API_TOKEN;
delete process.env.ENVSYNC_BASE_URL;
delete process.env.ENVSYNC_PROJECT_ID;
delete process.env.ENVSYNC_ENVIRONMENT;
