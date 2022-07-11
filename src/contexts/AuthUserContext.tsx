import { createContext, useContext, Context } from 'react'

import { User } from 'models/User';
import useFirebaseAuth from 'hooks/useFirebaseAuth';
interface AuthContext {
    authUser: User | null;
    loading: boolean;
    signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
    sendPasswordResetEmail:  (email: string) => Promise<any>;
    signOut: () => void;
}
const authUserContext: Context<AuthContext> = createContext<AuthContext>({
    authUser: null,
    loading: true,
    signInWithEmailAndPassword: async () => {},
    sendPasswordResetEmail: async () => {},
    signOut: async () => {}
});

export function AuthUserProvider({ children }) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}

export const useAuth = () => useContext(authUserContext);