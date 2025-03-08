import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { loginUser, logoutUser, getCurrentUser } from '../utils/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { migrateLocalStorageToFirestore } from '../utils/journal';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // User is signed in
        try {
          const user = await getCurrentUser();
          if (user) {
            setAuthState({
              currentUser: user,
              isAuthenticated: true,
            });
            
            // Attempt to migrate localStorage data to Firestore
            await migrateLocalStorageToFirestore();
          }
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      } else {
        // User is signed out
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const user = await loginUser(username, password);
      if (user) {
        setAuthState({
          currentUser: user,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser();
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
