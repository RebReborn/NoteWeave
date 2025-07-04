
"use client";

import * as React from "react";
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (
    ...args: Parameters<typeof signInWithEmailAndPassword>
  ) => ReturnType<typeof signInWithEmailAndPassword>;
  signUp: (
    ...args: Parameters<typeof createUserWithEmailAndPassword>
  ) => ReturnType<typeof createUserWithEmailAndPassword>;
  signOut: () => ReturnType<typeof firebaseSignOut>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn: (...args) => signInWithEmailAndPassword(auth, ...args),
    signUp: (...args) => createUserWithEmailAndPassword(auth, ...args),
    signOut: () => firebaseSignOut(auth),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
