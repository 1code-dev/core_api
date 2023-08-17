import { keys } from "../keys.config";

describe('ConfigService', () => {
  /**
   * Test case: All environment variables should not be null
   */
  it('all environment variables should not be null', () => {
    // Define the keys of the environment variables to be tested
    const config_keys = [
      'env',
      'supabase_key',
      'supabase_url',
      'jwt_key',
      'redis_url',
      'redis_password',
      'redis_port',
      'client_key',
    ];

    // Iterate over each key
    for (const key of config_keys) {
      // Retrieve the value of the environment variable using the configs object
      const value = keys[key];

      // Assert that the value is not null
      expect(value).toBeDefined();
      expect(value).not.toBeNull();
    }
  });
});
