// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

const useAuth = () => {
    const auth = useContext(AuthContext);
    
    if (!auth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    
    return auth;
};

export default useAuth;


// import { useContext } from "react";
// import { AuthContext } from "../provider/AuthProvider";

// const useAuth = () => {
//     const auth = useContext(AuthContext);
//     return auth;
// };

// export default useAuth;