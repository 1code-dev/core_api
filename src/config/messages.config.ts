export const errorMessages = {
  // Others

  internal_server_error:
    'Some unknown error has occurred! Please try again later',
  client_not_verified: 'Client is not verified!',
  invalid_base_64: 'Please provide valid base64 string',

  // DB errors

  db_error: 'unable to process query with database! Please try again later',

  unable_to_create_user: 'Unable to create user! Please try again later',
  unable_to_delete_user: 'Unable to delete user profile',
  unable_to_fetch_user: 'Unable to fetch user profile',
  user_already_created: 'Profile already exists!',
  unable_to_count_users: 'Unable to create user! Please try again later',
  user_profile_not_found: 'Profile not found!',

  unable_to_join_track:
    'Unable to join track at this moment! Please try again later',
  track_already_joined: 'Track is already joined by User!',

  unable_to_fetch_user_track: 'Unable to get user tracks!',

  unable_to_fetch_exercises: 'Unable to fetch exercises!',
  unable_to_fetch_exercise_details: 'Unable to fetch exercise info!',
  exercise_not_found: 'Exercise not found!',

  unable_to_run_test: 'Unable to run tests!',
  invalid_test_input: 'Invalid code input received!',
  unable_to_create_activity: 'Unable to create user activity',
  unable_to_incr_points: 'Unable to increment points!',

  unable_to_fetch_user_completed_exercises:
    'Unable to fetch completed exercises for user!',

  // Validation errors

  uuid_not_valid: 'UUID is not in valid format',
  track_id_not_valid: 'Track ID is not in valid format',
};

export const responseMessages = {
  created_user: 'Created user successfully!',
  fetched_user: 'Fetched user profile successfully!',
  deleted_user: 'Deleted user profile successfully!',
  fetched_track: 'Fetched all the tracks successfully!',
  joined_track: 'Track joined successfully!',
  fetched_exercises: 'Fetched all available exercise successfully!',
  fetched_exercise_details: 'Fetched exercise details successfully!',
  test_executed_successfully: 'Tests executed successfully!',
  exercise_already_completed: 'Exercise already completed!',
  fetched_completed_exercises: 'Fetched completed exercises successfully!',
};

export const warningMessages = {};
