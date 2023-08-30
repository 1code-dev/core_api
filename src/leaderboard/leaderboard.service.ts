import { Injectable } from '@nestjs/common';
import { redisClient } from './../core/db/redis.db';

@Injectable()
export class LeaderboardService {
  /**
   * Fetch top 20 users profile in global leaderboard
   *
   * @returns top 20 users in global leaderboard
   */
  async fetchTop20GlobalLeaderboard() {
    const cachedData = await redisClient.get('globalTop20');

    return cachedData;
  }

  /**
   * Fetch top 20 users profile in weekly leaderboard
   *
   * @returns top 20 users in weekly leaderboard
   */
  async fetchTop20WeeklyLeaderBoard() {
    const cachedData = await redisClient.get('weeklyTop20');

    return cachedData;
  }
}
