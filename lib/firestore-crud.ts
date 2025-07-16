// Firestore CRUD operations index
// This file exports all CRUD operations for easy import

export { 
  challengesCRUD, 
  adminChallengesCRUD 
} from './firestore-challenges';

export { 
  teamsCRUD, 
  adminTeamsCRUD 
} from './firestore-teams';

export { 
  submissionsCRUD, 
  adminSubmissionsCRUD 
} from './firestore-submissions';

// Type exports for convenience
export type {
  Challenge,
  Team,
  Submission,
  AlgorithmicProblem,
  BuildathonProblem,
  AdminUser,
  TeamProgress
} from './database-schema';