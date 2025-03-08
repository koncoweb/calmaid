import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { JournalEntry } from '../types';

const JOURNAL_COLLECTION = 'journal_entries';

// Get all journal entries for the current user
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    if (!auth.currentUser) {
      console.log("No authenticated user, cannot fetch journal entries");
      return [];
    }
    
    const userId = auth.currentUser.uid;
    console.log("Fetching journal entries for user:", userId);
    
    const entriesRef = collection(db, JOURNAL_COLLECTION);
    
    try {
      // First try with both where and orderBy (requires composite index)
      const q = query(
        entriesRef, 
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} journal entries`);
      
      const entries: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        const entryData = doc.data() as JournalEntry;
        entries.push({
          ...entryData,
          id: doc.id
        });
      });
      
      return entries;
    } catch (indexError: any) {
      // Check if the error is related to missing index
      if (indexError.code === 'failed-precondition' && indexError.message.includes('index')) {
        console.warn("Missing Firestore index. Falling back to non-ordered query.");
        console.warn("To fix this permanently, create the index using the URL in the error message.");
        
        // Fall back to just the where clause without ordering
        const fallbackQuery = query(
          entriesRef, 
          where("userId", "==", userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackEntries: JournalEntry[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          const entryData = doc.data() as JournalEntry;
          fallbackEntries.push({
            ...entryData,
            id: doc.id
          });
        });
        
        // Sort entries client-side as a fallback
        fallbackEntries.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return fallbackEntries;
      } else {
        // If it's a different error, rethrow it
        throw indexError;
      }
    }
  } catch (error) {
    console.error("Error getting journal entries:", error);
    throw error; // Re-throw to handle in component
  }
};

// Get a specific journal entry by ID
export const getJournalEntryById = async (id: string): Promise<JournalEntry | null> => {
  try {
    if (!auth.currentUser) {
      console.log("No authenticated user, cannot fetch journal entry");
      throw new Error("User not authenticated");
    }
    
    console.log("Fetching journal entry:", id);
    const entryDocRef = doc(db, JOURNAL_COLLECTION, id);
    const entryDoc = await getDoc(entryDocRef);
    
    if (!entryDoc.exists()) {
      console.log("Journal entry not found:", id);
      return null;
    }
    
    // Verify this entry belongs to the current user
    const entryData = entryDoc.data() as JournalEntry;
    if (entryData.userId !== auth.currentUser.uid) {
      console.log("Journal entry does not belong to current user");
      throw new Error("You don't have permission to view this entry");
    }
    
    return {
      ...entryData,
      id: entryDoc.id
    };
  } catch (error) {
    console.error("Error getting journal entry:", error);
    throw error; // Re-throw to handle in component
  }
};

// Add a new journal entry
export const addJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'userId'>): Promise<JournalEntry | null> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = auth.currentUser.uid;
    console.log("Adding new journal entry for user:", userId);
    
    const entryRef = doc(collection(db, JOURNAL_COLLECTION));
    
    const newEntry = {
      ...entryData,
      userId,
      id: entryRef.id
    };
    
    await setDoc(entryRef, newEntry);
    console.log("Journal entry added successfully:", entryRef.id);
    
    return newEntry;
  } catch (error) {
    console.error("Error adding journal entry:", error);
    throw error; // Re-throw to handle in component
  }
};

// Update an existing journal entry
export const updateJournalEntry = async (
  id: string, 
  entryData: Omit<JournalEntry, 'id' | 'userId'>
): Promise<JournalEntry | null> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    console.log("Updating journal entry:", id);
    const entryDocRef = doc(db, JOURNAL_COLLECTION, id);
    const entryDoc = await getDoc(entryDocRef);
    
    if (!entryDoc.exists()) {
      console.log("Journal entry not found:", id);
      return null;
    }
    
    // Verify this entry belongs to the current user
    const existingEntry = entryDoc.data() as JournalEntry;
    if (existingEntry.userId !== auth.currentUser.uid) {
      throw new Error("You don't have permission to update this entry");
    }
    
    await updateDoc(entryDocRef, {
      ...entryData
    });
    
    console.log("Journal entry updated successfully:", id);
    
    return {
      ...entryData,
      userId: auth.currentUser.uid,
      id
    };
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error; // Re-throw to handle in component
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    console.log("Deleting journal entry:", id);
    const entryDocRef = doc(db, JOURNAL_COLLECTION, id);
    const entryDoc = await getDoc(entryDocRef);
    
    if (!entryDoc.exists()) {
      console.log("Journal entry not found:", id);
      return false;
    }
    
    // Verify this entry belongs to the current user
    const existingEntry = entryDoc.data() as JournalEntry;
    if (existingEntry.userId !== auth.currentUser.uid) {
      throw new Error("You don't have permission to delete this entry");
    }
    
    await deleteDoc(entryDocRef);
    console.log("Journal entry deleted successfully:", id);
    return true;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error; // Re-throw to handle in component
  }
};

// Migrate existing localStorage entries to Firestore
export const migrateLocalStorageToFirestore = async (): Promise<void> => {
  try {
    if (!auth.currentUser) {
      console.log("User not authenticated, skipping migration");
      return;
    }
    
    const userId = auth.currentUser.uid;
    const localEntries = localStorage.getItem('pulih_alami_journal');
    
    if (!localEntries) {
      console.log("No local entries to migrate");
      return;
    }
    
    try {
      const parsedEntries = JSON.parse(localEntries);
      
      if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
        console.log("No valid entries to migrate");
        return;
      }
      
      console.log(`Migrating ${parsedEntries.length} entries to Firestore...`);
      
      // Check if we already have entries for this user
      const entriesRef = collection(db, JOURNAL_COLLECTION);
      const q = query(entriesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log("User already has Firestore entries, skipping migration");
        return;
      }
      
      // Migrate each entry
      for (const entry of parsedEntries) {
        const entryRef = doc(collection(db, JOURNAL_COLLECTION));
        
        await setDoc(entryRef, {
          ...entry,
          userId,
          id: entryRef.id
        });
      }
      
      console.log("Migration complete!");
      
      // Clear local storage entries
      localStorage.removeItem('pulih_alami_journal');
    } catch (error) {
      console.error("Error parsing local entries:", error);
    }
  } catch (error) {
    console.error("Error during migration:", error);
  }
};
