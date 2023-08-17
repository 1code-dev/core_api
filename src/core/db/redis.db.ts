import { Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { keys } from '../../config/keys.config';

/**
 * Instance of redis client to communicate w/ secondary db
 */
export let redisClient: Redis;

/**
 * Assign a new redis client instance to `redisClient` variable which is globally available
 */
export function connectRedisClient() {
  const logger = new Logger('Redis DB');
  const url: string = keys.redis_url;
  const password: string = keys.redis_password;
  const port: string = keys.redis_port;

  redisClient = new Redis({
    host: url,
    port: parseInt(port),
    password: password,
    lazyConnect: true,
  });

  redisClient.on('connect', (s: any) => {
    logger.log(`Connected to redis client! w/ ${s}`);
  });

  redisClient.on('close', () => {
    logger.log(`Disconnected from redis!`);
  });

  redisClient.on('error', (error) => {
    logger.error(error);
  });
}

/**
 * Disconnect an active connection from redis db
 */
export function disconnectRedisClient() {
  redisClient.disconnect();
}
