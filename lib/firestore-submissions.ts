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
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { adminDb, adminInitialized } from './firebase-admin';
import { Submission } from './database-schema';

const SUBMISSIONS_COLLECTION = 'submissions';

// Client-side CRUD operations
export const submissionsCRUD = {
  // Create a new submission
  async create(submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
        ...submissionData,
        submittedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  // Read all submissions
  async getAll(): Promise<Submission[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'))
      );
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  },

  // Read a single submission by ID
  async getById(id: string): Promise<Submission | null> {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          submittedAt: docSnap.data().submittedAt?.toDate(),
          evaluatedAt: docSnap.data().evaluatedAt?.toDate()
        } as Submission;
      }
      return null;
    } catch (error) {
      console.error('Error getting submission by ID:', error);
      throw error;
    }
  },

  // Read submissions by team ID
  async getByTeamId(teamId: string): Promise<Submission[]> {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('teamId', '==', teamId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by team ID:', error);
      throw error;
    }
  },

  // Read submissions by challenge ID
  async getByChallengeId(challengeId: string): Promise<Submission[]> {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('challengeId', '==', challengeId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by challenge ID:', error);
      throw error;
    }
  },

  // Read submissions by team and challenge
  async getByTeamAndChallenge(teamId: string, challengeId: string): Promise<Submission[]> {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('teamId', '==', teamId),
        where('challengeId', '==', challengeId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by team and challenge:', error);
      throw error;
    }
  },

  // Read submissions by status
  async getByStatus(status: Submission['status']): Promise<Submission[]> {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('status', '==', status),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by status:', error);
      throw error;
    }
  },

  // Update a submission
  async update(id: string, updateData: Partial<Omit<Submission, 'id' | 'submittedAt'>>): Promise<void> {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      const updatePayload: any = { ...updateData };
      
      if (updateData.status && updateData.status !== 'pending') {
        updatePayload.evaluatedAt = Timestamp.now();
      }
      
      await updateDoc(docRef, updatePayload);
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },

  // Delete a submission
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

// Admin-side CRUD operations (server-side)
export const adminSubmissionsCRUD = {
  // Create a new submission
  async create(submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<string> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const docRef = await adminDb.collection(SUBMISSIONS_COLLECTION).add({
        ...submissionData,
        submittedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating submission (admin):', error);
      throw error;
    }
  },

  // Read all submissions
  async getAll(): Promise<Submission[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(SUBMISSIONS_COLLECTION)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions (admin):', error);
      throw error;
    }
  },

  // Read a single submission by ID
  async getById(id: string): Promise<Submission | null> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const doc = await adminDb.collection(SUBMISSIONS_COLLECTION).doc(id).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data()?.submittedAt?.toDate(),
          evaluatedAt: doc.data()?.evaluatedAt?.toDate()
        } as Submission;
      }
      return null;
    } catch (error) {
      console.error('Error getting submission by ID (admin):', error);
      throw error;
    }
  },

  // Read submissions by team ID
  async getByTeamId(teamId: string): Promise<Submission[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(SUBMISSIONS_COLLECTION)
        .where('teamId', '==', teamId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by team ID (admin):', error);
      throw error;
    }
  },

  // Read submissions by challenge ID
  async getByChallengeId(challengeId: string): Promise<Submission[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(SUBMISSIONS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by challenge ID (admin):', error);
      throw error;
    }
  },

  // Read submissions by team and challenge
  async getByTeamAndChallenge(teamId: string, challengeId: string): Promise<Submission[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(SUBMISSIONS_COLLECTION)
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by team and challenge (admin):', error);
      throw error;
    }
  },

  // Read submissions by status
  async getByStatus(status: Submission['status']): Promise<Submission[]> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb
        .collection(SUBMISSIONS_COLLECTION)
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        evaluatedAt: doc.data().evaluatedAt?.toDate()
      })) as Submission[];
    } catch (error) {
      console.error('Error getting submissions by status (admin):', error);
      throw error;
    }
  },

  // Update a submission
  async update(id: string, updateData: Partial<Omit<Submission, 'id' | 'submittedAt'>>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const updatePayload: any = { ...updateData };
      
      if (updateData.status && updateData.status !== 'pending') {
        updatePayload.evaluatedAt = new Date();
      }
      
      await adminDb.collection(SUBMISSIONS_COLLECTION).doc(id).update(updatePayload);
    } catch (error) {
      console.error('Error updating submission (admin):', error);
      throw error;
    }
  },

  // Delete a submission
  async delete(id: string): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      await adminDb.collection(SUBMISSIONS_COLLECTION).doc(id).delete();
    } catch (error) {
      console.error('Error deleting submission (admin):', error);
      throw error;
    }
  },

  // Get submission statistics
  async getStats(): Promise<{
    totalSubmissions: number;
    pendingSubmissions: number;
    acceptedSubmissions: number;
    rejectedSubmissions: number;
    submissionsByType: { algorithmic: number; buildathon: number };
  }> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const snapshot = await adminDb.collection(SUBMISSIONS_COLLECTION).get();
      const submissions = snapshot.docs.map((doc: any) => doc.data()) as Submission[];
      
      const totalSubmissions = submissions.length;
      const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
      const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;
      const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
      
      const submissionsByType = {
        algorithmic: submissions.filter(s => s.type === 'algorithmic').length,
        buildathon: submissions.filter(s => s.type === 'buildathon').length
      };
      
      return {
        totalSubmissions,
        pendingSubmissions,
        acceptedSubmissions,
        rejectedSubmissions,
        submissionsByType
      };
    } catch (error) {
      console.error('Error getting submission stats (admin):', error);
      throw error;
    }
  },

  // Batch update submissions
  async batchUpdate(updates: Array<{ id: string; data: Partial<Omit<Submission, 'id' | 'submittedAt'>> }>): Promise<void> {
    if (!adminInitialized || !adminDb) {
      throw new Error('Firebase Admin not initialized. Cannot perform admin operations.');
    }
    
    try {
      const batch = adminDb.batch();
      
      updates.forEach(({ id, data }) => {
        const docRef = adminDb.collection(SUBMISSIONS_COLLECTION).doc(id);
        const updatePayload: any = { ...data };
        
        if (data.status && data.status !== 'pending') {
          updatePayload.evaluatedAt = new Date();
        }
        
        batch.update(docRef, updatePayload);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating submissions (admin):', error);
      throw error;
    }
  }
};