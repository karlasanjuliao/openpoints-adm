import { useState, useEffect } from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { useRouter } from 'next/router'

import firebaseClient from 'services/firebase/client';
import UserService from 'services/api/User';

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter()

  const authStateChanged = (token: string) => {
    firebaseClient.auth().onAuthStateChanged(async (user) => {
      if (token && user && !authUser) {
        const userData = await UserService.getUser(token)
        if (userData) {
          setAuthUser(userData);
          setCookie(undefined, 'destino-ferias-admin.token', token, {});
        }
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    const { 'destino-ferias-admin.token': token } = parseCookies()
    if (token) {
      authStateChanged(token)
    } else {
      router.replace('/login')
    }
  }, []);

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    const authState = await firebaseClient.auth().signInWithEmailAndPassword(email, password)
    const token = await authState.user.getIdToken()
    if (!authState) {
      throw new Error('Erro');
    }
    await authStateChanged(token)
  }

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseClient.auth().sendPasswordResetEmail(email)
    } catch(error) {
      throw new Error('Ocorreu um erro.');
    }
  }

  const clear = () => {
    destroyCookie({}, 'destino-ferias-admin.token')
    setAuthUser(null);
    router.replace('/login')
  };

  const signOut = () => {
    setLoading(true)
    firebaseClient.auth().signOut().then(clear);
  }

  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
  };
}