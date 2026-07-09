'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AppUser {
  uid: string;
  isAnonymous: boolean;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInGuest: () => Promise<AppUser>;
  signInGoogle: () => Promise<AppUser>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInGuest: async () => {
    throw new Error('AuthProvider missing');
  },
  signInGoogle: async () => {
    throw new Error('AuthProvider missing');
  },
  signOutUser: async () => {},
});

const toAppUser = (u: {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): AppUser => ({
  uid: u.uid,
  isAnonymous: u.isAnonymous,
  email: u.email,
  name: u.displayName,
  image: u.photoURL,
});

export const friendlyAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('configuration-not-found') || code.includes('operation-not-allowed')) {
    return '⚙️ 로그인 기능이 아직 준비 중이에요. 잠시 후 다시 시도해주세요!';
  }
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
    return '🙈 로그인 창이 닫혔어요. 다시 시도해주세요!';
  }
  if (code.includes('network-request-failed')) {
    return '📡 인터넷 연결을 확인해주세요!';
  }
  return '😢 로그인에 실패했어요. 다시 시도해주세요!';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInGuest = async () => {
    const credential = await signInAnonymously(auth);
    return toAppUser(credential.user);
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return toAppUser(credential.user);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest, signInGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
