/**
 * @type Local type for fetching all available exercises in a track w/o details
 */
export interface TAllExercises {
  // id of exercise
  id: string;

  // name of the exercise
  name: string;

  // maxPoints available for the exercise
  maxPoints: number;

  // level of exercise
  level: number;
}
