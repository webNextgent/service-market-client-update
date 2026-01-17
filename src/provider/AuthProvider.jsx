import { createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import auth from "../firebase/firebase.config";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const axiosPublic = useAxiosPublic();

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const googleSignInUser = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const githubSignInUser = () => {
        setLoading(true);
        return signInWithPopup(auth, githubProvider);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    // use name and photoUrl 
    // const updateUserProfile = (name, photoUrl) => {
    //     updateProfile(auth.currentUser, {
    //         displayName: name, photoURL: photoUrl
    //     })
    // }

    // just use name 
    const updateUserProfile = (name) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
        });
    };

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            console.log(currentUser);
            if (currentUser) {
                const userEmail = {
                    email: currentUser?.email
                }
                axiosPublic.post('/jwt', userEmail)
                    .then(res => {
                        if (res.data.token) {
                            localStorage.setItem('access-token', res.data.token);
                            setLoading(false);
                        }
                    })
            } else {
                localStorage.removeItem('access-token');
                setLoading(false);
            }
        });
        return () => { unSubscribe() }
    }, [axiosPublic]);

    const authInfo = { user, loading, createUser, signInUser, googleSignInUser, logOut, updateUserProfile, githubSignInUser }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;