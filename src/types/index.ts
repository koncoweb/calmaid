export type User = {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  // password removed from type as it shouldn't be stored in Firestore
};

export type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
};

export type JournalEntry = {
  id: string;
  userId: string;  // Added to link entries to users
  timestamp: string;  // ISO date string
  triggers: string;
  symptoms: string;
  strategies: string;
  notes: string;
  condition: number; // 0 = Masih Cemas, 1 = Lebih Baik, 2 = Tenang
};
