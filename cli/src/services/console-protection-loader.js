// EnvSync Console Protection Module
// This file is dynamically generated and injected via Node's --require flag

const ENVSYNC_SECRET_KEYS = process.env.ENVSYNC_SECRET_KEYS ? JSON.parse(process.env.ENVSYNC_SECRET_KEYS) : [];
const ENVSYNC_SECRET_VALUES = process.env.ENVSYNC_SECRET_VALUES ? JSON.parse(process.env.ENVSYNC_SECRET_VALUES) : [];

// Store original console methods
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;
const originalDebug = console.debug;

// Create Set for faster lookup
const secretValueSet = new Set(ENVSYNC_SECRET_VALUES);

/**
 * Redact secrets from arguments
 */
function redactSecrets(args) {
  return args.map(arg => {
    // Handle strings
    if (typeof arg === 'string') {
      let redacted = arg;
      secretValueSet.forEach(secretValue => {
        if (secretValue && redacted.includes(secretValue)) {
          // Simple string replacement (no regex to avoid escaping issues)
          while (redacted.includes(secretValue)) {
            redacted = redacted.replace(secretValue, '[REDACTED]');
          }
        }
      });
      return redacted;
    }
    
    // Handle objects (including process.env)
    if (typeof arg === 'object' && arg !== null) {
      try {
        // Clone the object
        const cloned = JSON.parse(JSON.stringify(arg));
        
        // Recursively redact object values
        function redactObject(obj) {
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              // Redact if key is a known secret key
              if (ENVSYNC_SECRET_KEYS.includes(key)) {
                obj[key] = '[REDACTED]';
              }
              // Redact if value matches a secret value
              else if (typeof obj[key] === 'string') {
                secretValueSet.forEach(secretValue => {
                  if (secretValue && obj[key] && obj[key].includes(secretValue)) {
                    obj[key] = '[REDACTED]';
                  }
                });
              }
              // Recursively handle nested objects
              else if (typeof obj[key] === 'object' && obj[key] !== null) {
                redactObject(obj[key]);
              }
            }
          }
        }
        
        redactObject(cloned);
        return cloned;
      } catch (e) {
        // If cloning fails, return original
        return arg;
      }
    }
    
    return arg;
  });
}

// Override console.log
console.log = function(...args) {
  originalLog.apply(console, redactSecrets(args));
};

// Override console.info
console.info = function(...args) {
  originalInfo.apply(console, redactSecrets(args));
};

// Override console.warn
console.warn = function(...args) {
  originalWarn.apply(console, redactSecrets(args));
};

// Override console.error
console.error = function(...args) {
  originalError.apply(console, redactSecrets(args));
};

// Override console.debug
console.debug = function(...args) {
  originalDebug.apply(console, redactSecrets(args));
};

// Log protection activation (using original method to avoid recursion)
originalInfo.call(console, '\x1b[33m🔒 [EnvSync] Console logging protection active - secret values will be redacted\x1b[0m');

// Clean up environment variables used for protection
delete process.env.ENVSYNC_SECRET_KEYS;
delete process.env.ENVSYNC_SECRET_VALUES;
