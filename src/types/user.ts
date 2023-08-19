/**
 * @type Global type for Users profile
 */
export interface TUserProfile {
  uid?: string;
  longestStreak: number;
  streak: number;
  totalPoints: number;
  globalRank: number;
  weeklyRank: number;
}
