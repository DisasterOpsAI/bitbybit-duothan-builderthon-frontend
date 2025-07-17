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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { adminDb, adminInitialized } from './firebase-admin';
import { Challenge } from './database-schema';

const CHALLENGES_COLLECTION = 'challenges';

// Client-side CRUD operations
export const challengesCRUD = {
  // Create a new challenge
  async create(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), {
        ...challengeData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Read all challenges
  async getAll(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, CHALLENGES_COLLECTION), orderBy('order', 'asc'))
      );
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Challenge[];
    } catch (error) {
      console.error('Error getting challenges:', error);
      throw error;
    }
  },

  // Read active challenges only
  async getActive(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, CHALLENGES_COLLECTION), 
          where('isActive', '==', true),
          orderBy('order', 'asc')
        )
      );
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Challenge[];
    } catch (error) {
      console.error('Error getting active challenges:', error);
      throw error;
    }
  },

  // Read a single challenge by ID
  async getById(id: string): Promise<Challenge | null> {
    try {
      const docRef = doc(db, CHALLENGES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Challenge;
      }
      return null;
    } catch (error) {
      console.error('Error getting challenge by ID:', error);
      throw error;
    }
  },

  // Update a challenge
  async update(id: string, updateData: Partial<Omit<Challenge, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, CHALLENGES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  },

  // Delete a challenge
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, CHALLENGES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  },

  // Get challenges with pagination
  async getPaginated(limitCount: number = 10, lastOrder?: number): Promise<Challenge[]> {
    try {
      let q = query(
        collection(db, CHALLENGES_COLLECTION),
        orderBy('order', 'asc'),
        limit(limitCount)
      );

      if (lastOrder) {
        q = query(
          collection(db, CHALLENGES_COLLECTION),
          orderBy('order', 'asc'),
          where('order', '>', lastOrder),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Challenge[];
    } catch (error) {
      console.error('Error getting paginated challenges:', error);
      throw error;
    }
  }
};

// Admin-side CRUD operations (server-side)
export const adminChallengesCRUD = {
  // Create a new challenge
  async create(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const docRef = await adminDb.collection(CHALLENGES_COLLECTION).add({
        ...challengeData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating challenge (admin):', error);
      throw error;
    }
  },

  // Read all challenges
  async getAll(): Promise<Challenge[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(CHALLENGES_COLLECTION)
        .orderBy('order', 'asc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Challenge[];
    } catch (error) {
      console.error('Error getting challenges (admin):', error);
      throw error;
    }
  },

  // Read active challenges only
  async getActive(): Promise<Challenge[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      console.log('Fetching active challenges from Firestore...');
      const snapshot = await adminDb
        .collection(CHALLENGES_COLLECTION)
        .where('isActive', '==', true)
        .get();
      
      console.log('Found', snapshot.size, 'active challenges');
      
      const challenges = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        console.log('Challenge data:', doc.id, { isActive: data.isActive, title: data.title });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }) as Challenge[];
      
      return challenges;
    } catch (error) {
      console.error('Error getting active challenges (admin):', error);
      throw error;
    }
  },

  // Read a single challenge by ID
  async getById(id: string): Promise<Challenge | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const doc = await adminDb.collection(CHALLENGES_COLLECTION).doc(id).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt?.toDate(),
          updatedAt: doc.data()?.updatedAt?.toDate()
        } as Challenge;
      }
      return null;
    } catch (error) {
      console.error('Error getting challenge by ID (admin):', error);
      throw error;
    }
  },

  // Update a challenge
  async update(id: string, updateData: Partial<Omit<Challenge, 'id' | 'createdAt'>>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      await adminDb.collection(CHALLENGES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating challenge (admin):', error);
      throw error;
    }
  },

  // Delete a challenge
  async delete(id: string): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      await adminDb.collection(CHALLENGES_COLLECTION).doc(id).delete();
    } catch (error) {
      console.error('Error deleting challenge (admin):', error);
      throw error;
    }
  },

  // Batch update challenges
  async batchUpdate(updates: Array<{ id: string; data: Partial<Omit<Challenge, 'id' | 'createdAt'>> }>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const batch = adminDb.batch();
      
      updates.forEach(({ id, data }) => {
        const docRef = adminDb.collection(CHALLENGES_COLLECTION).doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating challenges (admin):', error);
      throw error;
    }
  }
};