import { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import API from '../api/axios';
import { createEmailDomainError, isAllowedCuetEmail } from '../utils/emailDomain';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user to MongoDB and fetch profile
  const syncUser = async (firebaseUser, extraData = {}) => {
    if (!isAllowedCuetEmail(firebaseUser.email)) {
      throw createEmailDomainError();
    }

    try {
      await API.post('/auth/sync', {
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || extraData.name || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || '',
        ...extraData,
      });

      const res = await API.get('/auth/me', {
        headers: { 'x-firebase-uid': firebaseUser.uid },
      });
      setDbUser(res.data);
      return res.data;
    } catch (error) {
      console.error('Error syncing user:', error);
      // If server is down, set basic user data
      setDbUser({
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        role: extraData.requestedRole || 'student',
        department: 'CSE',
        year: '1st',
        status: 'active',
      });
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!isAllowedCuetEmail(firebaseUser.email)) {
          await signOut(auth);
          setUser(null);
          setDbUser(null);
        } else {
          setUser(firebaseUser);
          await syncUser(firebaseUser);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedCuetEmail(normalizedEmail)) {
      throw createEmailDomainError();
    }

    const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const profile = await syncUser(result.user);
    return profile;
  };

  const register = async ({ name, email, password, studentId, department, year, requestedRole }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedCuetEmail(normalizedEmail)) {
      throw createEmailDomainError();
    }

    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await updateProfile(result.user, { displayName: name });
    const profile = await syncUser(result.user, { name, studentId, department, year, requestedRole });
    return profile;
  };

  const loginWithGoogle = async (requestedRole) => {
    const result = await signInWithPopup(auth, googleProvider);
    if (!isAllowedCuetEmail(result.user.email)) {
      await signOut(auth);
      throw createEmailDomainError();
    }

    const profile = await syncUser(result.user, requestedRole ? { requestedRole } : {});
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
  };

  const value = {
    user,         // Firebase user
    dbUser,       // MongoDB user profile
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    syncUser,
    setDbUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
