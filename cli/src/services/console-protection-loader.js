// EnvSync Console and File System Protection Module
// This file is dynamically generated and injected via Node's --require flag

const fs = require('fs');

const ENVSYNC_SECRET_KEYS = process.env.ENVSYNC_SECRET_KEYS ? JSON.parse(process.env.ENVSYNC_SECRET_KEYS) : [];
const ENVSYNC_SECRET_VALUES = process.env.ENVSYNC_SECRET_VALUES ? JSON.parse(process.env.ENVSYNC_SECRET_VALUES) : [];

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
const originalFsCreateWriteStream = fs.createWriteStream;

// Create Set for faster lookup
const secretValueSet = new Set(ENVSYNC_SECRET_VALUES.filter(v => v && v.length > 3)); // Only mask values > 3 chars to avoid false positives

/**
 * Redact secrets from a string
 */
function redactString(str) {
  if (typeof str !== 'string') return str;
  let redacted = str;
  secretValueSet.forEach(secretValue => {
    if (redacted.includes(secretValue)) {
      const escapedSecret = secretValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSecret, 'g');
      redacted = redacted.replace(regex, '[REDACTED]');
    }
  });
  return redacted;
}

/**
 * Redact secrets from arguments
 */
function redactSecrets(args) {
  return args.map(arg => {
    // Handle strings
    if (typeof arg === 'string') {
      return redactString(arg);
    }
    
    // Handle objects (including process.env)
    if (typeof arg === 'object' && arg !== null) {
      try {
        const cloned = JSON.parse(JSON.stringify(arg));
        
        function redactObject(obj) {
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              if (ENVSYNC_SECRET_KEYS.includes(key)) {
                obj[key] = '[REDACTED]';
              } else if (typeof obj[key] === 'string') {
                obj[key] = redactString(obj[key]);
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                redactObject(obj[key]);
              }
            }
          }
        }
        
        redactObject(cloned);
        return cloned;
      } catch (e) {
        return arg;
      }
    }
    
    return arg;
  });
}

// Override console methods
console.log = (...args) => originalLog.apply(console, redactSecrets(args));
console.info = (...args) => originalInfo.apply(console, redactSecrets(args));
console.warn = (...args) => originalWarn.apply(console, redactSecrets(args));
console.error = (...args) => originalError.apply(console, redactSecrets(args));
console.debug = (...args) => originalDebug.apply(console, redactSecrets(args));

// Override process.stdout/stderr.write
process.stdout.write = function(chunk, encoding, callback) {
  if (typeof chunk === 'string') {
    return originalStdoutWrite.call(process.stdout, redactString(chunk), encoding, callback);
  }
  return originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
};

process.stderr.write = function(chunk, encoding, callback) {
  if (typeof chunk === 'string') {
    return originalStderrWrite.call(process.stderr, redactString(chunk), encoding, callback);
  }
  return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
};

// Override fs methods for Data Loss Prevention
fs.writeFile = function(path, data, options, callback) {
  let finalData = data;
  let finalCallback = callback;
  if (typeof options === 'function') finalCallback = options;

  if (typeof data === 'string') {
    finalData = redactString(data);
  }
  return originalFsWriteFile.call(fs, path, finalData, options, finalCallback);
};

fs.writeFileSync = function(path, data, options) {
  let finalData = data;
  if (typeof data === 'string') {
    finalData = redactString(data);
  }
  return originalFsWriteFileSync.call(fs, path, finalData, options);
};

fs.appendFile = function(path, data, options, callback) {
  let finalData = data;
  let finalCallback = callback;
  if (typeof options === 'function') finalCallback = options;

  if (typeof data === 'string') {
    finalData = redactString(data);
  }
  return originalFsAppendFile.call(fs, path, finalData, options, finalCallback);
};

fs.appendFileSync = function(path, data, options) {
  let finalData = data;
  if (typeof data === 'string') {
    finalData = redactString(data);
  }
  return originalFsAppendFileSync.call(fs, path, finalData, options);
};

// Log protection activation
originalInfo.call(console, '\x1b[33m🔒 [EnvSync] Security Shield Active: Console & File System protection enabled\x1b[0m');

// Clean up environment variables used for protection
delete process.env.ENVSYNC_SECRET_KEYS;
delete process.env.ENVSYNC_SECRET_VALUES;
