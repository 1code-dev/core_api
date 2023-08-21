export const errorMessages = {
  // Others

  internal_server_error:
    'Some unknown error has occurred! Please try again later',
  client_not_verified: 'Client is not verified!',

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
};

export const warningMessages = {};
