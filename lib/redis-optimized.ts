import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryDelayOnClusterDown: 300,
      // Connection pool settings
      family: 4,
      // Reconnection settings
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      },
    };

    client = new Redis(redisConfig);

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
      // Don't throw during build time
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Redis error in development - continuing without Redis');
      }
    });

    client.on('ready', () => {
      console.log('🚀 Redis ready for operations');
    });

    client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  return client;
}

// Safe Redis operations that won't fail during build
export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    const redis = getRedisClient();
    return await redis.get(key);
  } catch (error) {
    console.warn(`Redis GET failed for key ${key}:`, error);
    return null;
  }
}

export async function safeRedisSet(key: string, value: string, ttl?: number): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.warn(`Redis SET failed for key ${key}:`, error);
    return false;
  }
}

export async function safeRedisDel(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`Redis DEL failed for key ${key}:`, error);
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (client) {
    try {
      await client.quit();
      client = null;
      console.log('✅ Redis connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }
  }
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
