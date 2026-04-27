const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Base options
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Add TLS for Upstash/rediss
if (REDIS_URL.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false
  };
}

const createRedisConnection = () => new Redis(REDIS_URL, redisOptions);

// The main connection instance
const redisConnection = createRedisConnection();

redisConnection.on('error', (err) => {
  console.error('Redis Connection Error:', err.message);
});

redisConnection.on('connect', () => {
  console.log('Successfully connected to Upstash Redis');
});

module.exports = {
  redisConnection,
  createRedisConnection,
  redisOptions,
  REDIS_URL
};
