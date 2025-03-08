import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  deleteUser as firebaseDeleteUser,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  getAuth
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

const USERS_COLLECTION = 'users';

// Initialize default admin if no users exist
export const initializeUsers = async (): Promise<void> => {
  try {
    // Check if admin user exists
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    if (querySnapshot.empty) {
      // Create default admin
      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@admin.com', 'admin123');
        const firebaseUser = userCredential.user;
        
        // Set custom display name
        await updateProfile(firebaseUser, {
          displayName: 'admin'
        });
        
        // Create user document in firestore
        await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
          id: firebaseUser.uid,
          username: 'admin',
          role: 'admin',
          email: 'admin@admin.com'
        });
      } catch (error) {
        console.error("Error creating default admin:", error);
      }
    }
  } catch (error) {
    console.error("Error initializing users:", error);
  }
};

// Register new user
export const signupUser = async (
  username: string,
  email: string,
  password: string
): Promise<boolean> => {
  try {
    // Check if username already exists
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Username already exists');
    }
    
    // Check if email is already in use
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      throw new Error('email-already-in-use');
    }
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Set display name as the username
    await updateProfile(firebaseUser, {
      displayName: username
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
      id: firebaseUser.uid,
      username: username,
      role: 'user', // Default role for new users
      email: email
    });
    
    return true;
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      users.push({
        ...userData,
        id: doc.id
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Add new user
export const addUser = async (userData: { 
  username: string; 
  password: string; 
  role: 'admin' | 'user';
  email?: string;
}): Promise<User | null> => {
  try {
    // Check if username already exists
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("username", "==", userData.username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Username already exists');
    }
    
    // Create auth user with email (using provided email or username as email)
    const email = userData.email || `${userData.username}@pulihalami.app`;
    
    // Check if email is already in use
    if (userData.email) {
      const emailQuery = query(usersRef, where("email", "==", userData.email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        throw new Error('Email already in use');
      }
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
    const firebaseUser = userCredential.user;
    
    // Set custom display name
    await updateProfile(firebaseUser, {
      displayName: userData.username
    });
    
    // Create user document in firestore
    const newUser: User = {
      id: firebaseUser.uid,
      username: userData.username,
      role: userData.role,
      email: email
    };
    
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), newUser);
    
    return newUser;
  } catch (error: any) {
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email is already in use');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    }
    
    console.error("Error adding user:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (id: string, userData: Partial<{ 
  username: string; 
  password: string;
  email: string;
}>): Promise<User | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const currentUserData = userDoc.data() as User;
    
    // If changing username, check if the new username already exists
    if (userData.username && userData.username !== currentUserData.username) {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("username", "==", userData.username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Username already exists');
      }
      
      // Update username in Firestore
      await updateDoc(userDocRef, { username: userData.username });
      
      // Update displayName in Firebase Auth if possible
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: userData.username
          });
        } catch (error) {
          console.error("Could not update displayName in Firebase Auth:", error);
          // Continue anyway as Firestore update was successful
        }
      }
    }
    
    // Update email if provided
    if (userData.email && userData.email !== currentUserData.email) {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("email", "==", userData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Email already in use');
      }
      
      // Update email in Firestore
      await updateDoc(userDocRef, { email: userData.email });
      
      // Update email in Firebase Auth if possible
      if (auth.currentUser) {
        try {
          await updateEmail(auth.currentUser, userData.email);
        } catch (error) {
          console.error("Could not update email in Firebase Auth:", error);
          // Continue anyway as Firestore update was successful
        }
      }
    }
    
    // Update password if provided
    if (userData.password) {
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // For password updates, we'll use the administrative API if possible
      const userToUpdate = doc(db, USERS_COLLECTION, id);
      const userSnapshot = await getDoc(userToUpdate);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User;
        if (userData.email) {
          try {
            // Get a fresh instance of the Auth - helps avoid issues with current user
            const freshAuth = getAuth();
            
            // Check if this is the current user - if so we can update directly
            if (freshAuth.currentUser && freshAuth.currentUser.uid === id) {
              await updatePassword(freshAuth.currentUser, userData.password);
            } else {
              // Otherwise, we need to switch to account recovery or similar methods
              // Here we can send a password reset email that admin can forward to user
              await sendPasswordResetEmail(freshAuth, userData.email);
            }
          } catch (error) {
            console.error("Error updating password:", error);
            throw new Error('Could not update password');
          }
        }
      }
    }
    
    // Get updated user data
    const updatedUserDoc = await getDoc(userDocRef);
    return { ...updatedUserDoc.data(), id: updatedUserDoc.id } as User;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    // Delete from Firestore first
    const userDocRef = doc(db, USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    // Get user data for potential Firebase Auth deletion
    const userData = userDoc.data() as User;
    
    // Delete from Firestore
    await deleteDoc(userDocRef);
    
    // Then try to delete from Firebase Auth - this is tricky and might require re-authentication
    try {
      // If it's the current user, delete directly
      if (auth.currentUser && auth.currentUser.uid === id) {
        await firebaseDeleteUser(auth.currentUser);
      } else {
        // For deleting other users, we'd need admin SDK (Firebase Admin)
        // This typically requires a backend server
        // For now, we'll just delete from Firestore and consider it a success
        console.warn("Could not delete user from Firebase Auth - requires admin SDK or current user context");
      }
    } catch (error) {
      console.error("Error deleting user from Firebase Auth:", error);
      // Continue anyway as Firestore delete was successful
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

// Login user
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Find user with this username
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;
    
    // Sign in with Firebase Auth using email
    const email = userData.email || `${username}@pulihalami.app`;
    await signInWithEmailAndPassword(auth, email, password);
    
    // Return user data
    return {
      ...userData,
      id: userDoc.id
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

// Get current logged in user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    if (!auth.currentUser) {
      return null;
    }
    
    const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      ...userDoc.data(),
      id: userDoc.id
    } as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
