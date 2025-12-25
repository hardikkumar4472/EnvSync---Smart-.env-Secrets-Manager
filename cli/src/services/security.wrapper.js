
const originalEnv = { ...process.env };
function createSecureEnvProxy(secrets) {
  const sensitiveKeys = Object.keys(secrets);
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;

  const redactSecrets = (...args) => {
    return args.map(arg => {
      if (typeof arg === 'string') {
        let redacted = arg;
        Object.entries(secrets).forEach(([key, value]) => {
          if (value && redacted.includes(value)) {
            redacted = redacted.replace(new RegExp(value, 'g'), '[REDACTED]');
          }
        });
        return redacted;
      } else if (typeof arg === 'object' && arg !== null) {
        const redactedObj = JSON.parse(JSON.stringify(arg));
        const redactObject = (obj) => {
          for (let key in obj) {
            if (sensitiveKeys.includes(key)) {
              obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              redactObject(obj[key]);
            } else if (typeof obj[key] === 'string') {
              Object.values(secrets).forEach(secretValue => {
                if (secretValue && obj[key].includes(secretValue)) {
                  obj[key] = '[REDACTED]';
                }
              });
            }
          }
        };
        redactObject(redactedObj);
        return redactedObj;
      }
      return arg;
    });
  };

  console.log = (...args) => originalLog(...redactSecrets(...args));
  console.info = (...args) => originalInfo(...redactSecrets(...args));
  console.warn = (...args) => originalWarn(...redactSecrets(...args));
  console.error = (...args) => originalError(...redactSecrets(...args));
  console.debug = (...args) => originalDebug(...redactSecrets(...args));
  const envProxy = new Proxy(process.env, {
    get(target, prop) {
      if (sensitiveKeys.includes(prop)) {
        console.warn(`Access to sensitive environment variable: ${prop}`);
      }
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });

  return {
    envProxy,
    restore: () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
      console.debug = originalDebug;
    }
  };
}

module.exports = { createSecureEnvProxy };
