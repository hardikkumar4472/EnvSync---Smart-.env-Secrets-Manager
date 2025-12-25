/**
 * EnvSync Console Protection Module
 * Prevents developers from easily logging secret values via console.log
 * 
 * This is injected into the application runtime to redact secret values
 */

module.exports = function setupConsoleProtection(secretKeys, secretValues) {
  // Store original console methods
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;
  
  // Convert secret values to Set for faster lookup
  const secretSet = new Set(secretValues);
  
  /**
   * Redact secrets from console output
   */
  function redactSecrets(args) {
    return args.map(arg => {
      // Handle strings - replace secret values
      if (typeof arg === 'string') {
        let redacted = arg;
        secretSet.forEach(value => {
          if (value && redacted.includes(value)) {
            // Escape special regex characters
            const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            redacted = redacted.replace(new RegExp(escaped, 'g'), '[REDACTED]');
          }
        });
        return redacted;
      }
      
      // Handle objects (like process.env)
      if (typeof arg === 'object' && arg !== null) {
        try {
          const redactedObj = JSON.parse(JSON.stringify(arg));
          
          function redactObjectValues(obj) {
            for (let key in obj) {
              // Redact known secret keys
              if (secretKeys.includes(key)) {
                obj[key] = '[REDACTED]';
              }
              // Redact values that match secret values
              else if (typeof obj[key] === 'string') {
                secretSet.forEach(value => {
                  if (value && obj[key] && obj[key].includes(value)) {
                    obj[key] = '[REDACTED]';
                  }
                });
              }
              // Recursively redact nested objects
              else if (typeof obj[key] === 'object' && obj[key] !== null) {
                redactObjectValues(obj[key]);
              }
            }
          }
          
          redactObjectValues(redactedObj);
          return redactedObj;
        } catch (e) {
          // If JSON stringify fails, return original
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
  
  // Log protection activation
  originalInfo.call(console, '🔒 [EnvSync] Console logging protection active - secret values will be redacted');
  
  // Return restore function (if needed)
  return {
    restore: () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
      console.debug = originalDebug;
    }
  };
};
