import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { adminDb, adminInitialized } from './firebase-admin';
import { Team } from './database-schema';

const TEAMS_COLLECTION = 'teams';

// Client-side CRUD operations
export const teamsCRUD = {
  // Create a new team
  async create(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
        ...teamData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  // Read all teams
  async getAll(): Promise<Team[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, TEAMS_COLLECTION), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Team[];
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  },

  // Read a single team by ID
  async getById(id: string): Promise<Team | null> {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by ID:', error);
      throw error;
    }
  },

  // Read team by email
  async getByEmail(email: string): Promise<Team | null> {
    try {
      const q = query(
        collection(db, TEAMS_COLLECTION),
        where('email', '==', email),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by email:', error);
      throw error;
    }
  },

  // Read team by name
  async getByName(name: string): Promise<Team | null> {
    try {
      const q = query(
        collection(db, TEAMS_COLLECTION),
        where('name', '==', name),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by name:', error);
      throw error;
    }
  },

  // Read team by auth ID
  async getByAuthId(authId: string): Promise<Team | null> {
    try {
      const q = query(
        collection(db, TEAMS_COLLECTION),
        where('authId', '==', authId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by auth ID:', error);
      throw error;
    }
  },

  // Update a team
  async update(id: string, updateData: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Delete a team
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  // Update team points
  async updatePoints(id: string, points: number): Promise<void> {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, id);
      await updateDoc(docRef, {
        totalPoints: increment(points),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating team points:', error);
      throw error;
    }
  },

  // Add completed challenge to team
  async addCompletedChallenge(id: string, challengeId: string): Promise<void> {
    try {
      const team = await this.getById(id);
      if (team) {
        const completedChallenges = team.completedChallenges || [];
        if (!completedChallenges.includes(challengeId)) {
          completedChallenges.push(challengeId);
          await this.update(id, { completedChallenges });
        }
      }
    } catch (error) {
      console.error('Error adding completed challenge:', error);
      throw error;
    }
  },

  // Get leaderboard (teams ordered by points)
  async getLeaderboard(limitCount: number = 10): Promise<Team[]> {
    try {
      const q = query(
        collection(db, TEAMS_COLLECTION),
        orderBy('totalPoints', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Team[];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
};

// Admin-side CRUD operations (server-side)
export const adminTeamsCRUD = {
  // Create a new team
  async create(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const docRef = await adminDb.collection(TEAMS_COLLECTION).add({
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating team (admin):', error);
      throw error;
    }
  },

  // Read all teams
  async getAll(): Promise<Team[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(TEAMS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Team[];
    } catch (error) {
      console.error('Error getting teams (admin):', error);
      throw error;
    }
  },

  // Read a single team by ID
  async getById(id: string): Promise<Team | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const doc = await adminDb.collection(TEAMS_COLLECTION).doc(id).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt?.toDate(),
          updatedAt: doc.data()?.updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by ID (admin):', error);
      throw error;
    }
  },

  // Read team by email
  async getByEmail(email: string): Promise<Team | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(TEAMS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by email (admin):', error);
      throw error;
    }
  },

  // Read team by name
  async getByName(name: string): Promise<Team | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(TEAMS_COLLECTION)
        .where('name', '==', name)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by name (admin):', error);
      throw error;
    }
  },

  // Read team by auth ID
  async getByAuthId(authId: string): Promise<Team | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(TEAMS_COLLECTION)
        .where('authId', '==', authId)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Team;
      }
      return null;
    } catch (error) {
      console.error('Error getting team by auth ID (admin):', error);
      throw error;
    }
  },

  // Update a team
  async update(id: string, updateData: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      await adminDb.collection(TEAMS_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating team (admin):', error);
      throw error;
    }
  },

  // Delete a team
  async delete(id: string): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      await adminDb.collection(TEAMS_COLLECTION).doc(id).delete();
    } catch (error) {
      console.error('Error deleting team (admin):', error);
      throw error;
    }
  },

  // Update team points
  async updatePoints(id: string, points: number): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const docRef = adminDb.collection(TEAMS_COLLECTION).doc(id);
      await docRef.update({
        totalPoints: adminDb.FieldValue.increment(points),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating team points (admin):', error);
      throw error;
    }
  },

  // Add completed challenge to team
  async addCompletedChallenge(id: string, challengeId: string): Promise<void> {
    try {
      const team = await this.getById(id);
      if (team) {
        const completedChallenges = team.completedChallenges || [];
        if (!completedChallenges.includes(challengeId)) {
          completedChallenges.push(challengeId);
          await this.update(id, { completedChallenges });
        }
      }
    } catch (error) {
      console.error('Error adding completed challenge (admin):', error);
      throw error;
    }
  },

  // Get leaderboard (teams ordered by points)
  async getLeaderboard(limitCount: number = 10): Promise<Team[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(TEAMS_COLLECTION)
        .orderBy('totalPoints', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Team[];
    } catch (error) {
      console.error('Error getting leaderboard (admin):', error);
      throw error;
    }
  },

  // Get team statistics
  async getStats(): Promise<{
    totalTeams: number;
    totalPoints: number;
    averagePoints: number;
    teamsWithChallenges: number;
  }> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb.collection(TEAMS_COLLECTION).get();
      const teams = snapshot.docs.map((doc: any) => doc.data()) as Team[];
      
      const totalTeams = teams.length;
      const totalPoints = teams.reduce((sum, team) => sum + (team.totalPoints || 0), 0);
      const averagePoints = totalTeams > 0 ? totalPoints / totalTeams : 0;
      const teamsWithChallenges = teams.filter(team => 
        team.completedChallenges && team.completedChallenges.length > 0
      ).length;
      
      return {
        totalTeams,
        totalPoints,
        averagePoints,
        teamsWithChallenges
      };
    } catch (error) {
      console.error('Error getting team stats (admin):', error);
      throw error;
    }
  },

  // Batch update teams
  async batchUpdate(updates: Array<{ id: string; data: Partial<Omit<Team, 'id' | 'createdAt'>> }>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const batch = adminDb.batch();
      
      updates.forEach(({ id, data }) => {
        const docRef = adminDb.collection(TEAMS_COLLECTION).doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating teams (admin):', error);
      throw error;
    }
  }
};