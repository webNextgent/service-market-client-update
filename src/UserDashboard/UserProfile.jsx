// UserProfile.jsx - Updated version
import { FaUser } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from 'react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase.config";

const UserProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dbLoading, setDbLoading] = useState(true);

    // Load user data from Firebase Auth and Firestore
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) return;
            
            setDbLoading(true);
            try {
                // 1. Get name from Firebase Auth
                const displayName = user.displayName || '';
                const nameParts = displayName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                // 2. Try to get phone from Firestore
                let phoneNumber = '';
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        phoneNumber = userData.phone || '';
                    }
                } catch (dbError) {
                    console.warn('Firestore not accessible:', dbError);
                }
                
                setFormData({
                    firstName,
                    lastName,
                    email: user.email || '',
                    phone: phoneNumber
                });
                
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setDbLoading(false);
            }
        };
        
        loadUserData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        
        setLoading(true);
        
        try {
            // 1. Update Firebase Auth Profile (Name)
            await updateProfile(auth.currentUser, {
                displayName: `${formData.firstName} ${formData.lastName}`.trim(),
            });
            
            // 2. Try to save to Firestore
            try {
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: user.email,
                    phone: formData.phone,
                    displayName: `${formData.firstName} ${formData.lastName}`.trim(),
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
                
                console.log('✅ Data saved to Firestore');
            } catch (dbError) {
                console.warn('Could not save to Firestore:', dbError);
                // Fallback: Save to localStorage
                localStorage.setItem(`user_${user.uid}`, JSON.stringify({
                    phone: formData.phone,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                }));
            }
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            console.log('✅ Profile updated successfully');
            
        } catch (error) {
            console.error('❌ Profile update error:', error);
            alert('Failed to update profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (dbLoading) {
        return (
            <div className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26B2B]"></div>
                    <span className="ml-3 text-gray-600">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
         <div className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto">
             <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#5D4F52] border-b border-[#E5E7EB] pb-3">
                 <FaUser className="text-[#01788E]" /> Contact Information
             </h2>

             {/* Success Message */}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        Profile updated successfully!
                    </p>
                </div>
            )}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
                    />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
                    />
                </div>
            </div>

            <div className="md:flex items-center gap-6">
                {/* Email Section */}
                <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
                    <label className="text-sm text-gray-600">Email</label>
                    
                    <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F8F8F8]">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly // Email সাধারণত update করা যায় না
                            className="px-4 py-2 outline-none bg-transparent flex-1 text-gray-700"
                        />
                        
                        {/* Email Status */}
                        {/* {getEmailStatus()} */}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                    </p>
                </div>

                {/* Phone */}
                <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
                    <label className="text-sm text-gray-600">Phone</label>
                    
                    <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F8F8F8]">
                        {/* Flag */}
                        <div className="px-4 py-2 flex items-center gap-2 border-r border-[#E5E7EB] bg-white">
                            <img
                                src="https://flagcdn.com/w20/bd.png"
                                alt="BD Flag"
                                className="w-5 h-4 object-cover"
                            />
                            <span className="text-gray-700 text-sm">+880</span>
                        </div>

                        {/* Phone Number */}
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="1XXXXXXXXXX"
                            className="px-4 py-2 outline-none bg-transparent flex-1"
                        />
                        
                        {/* Success Icon */}
                        {formData.phone && (
                            <FaCheckCircle className="text-green-500 text-xl mr-3" />
                        )}
                    </div>
                </div>
            </div>

            {/* Button */}
            <div className="mt-10 flex justify-center">
                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`bg-[#F26B2B] text-white font-semibold px-10 py-2 rounded-md hover:bg-[#e26227] transition flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        'UPDATE'
                    )}
                </button>
            </div>
        </div>
    );
};

export default UserProfile;








// import { FaUser } from "react-icons/fa";
// import { FaCheckCircle } from "react-icons/fa";
// import useAuth from "../hooks/useAuth";
// import { useState, useEffect } from 'react';
// import { updateProfile } from "firebase/auth";
// import auth from "../firebase/firebase.config";

// const UserProfile = () => {
//     const { user } = useAuth();
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         phone: ''
//     });
//     const [loading, setLoading] = useState(false);
//     const [success, setSuccess] = useState(false);

//     // Firebase user থেকে data নেওয়া
//     useEffect(() => {
//         if (user) {
//             // Display name থেকে firstName এবং lastName আলাদা করা
//             const displayName = user.displayName || '';
//             const nameParts = displayName.split(' ');
//             const firstName = nameParts[0] || '';
//             const lastName = nameParts.slice(1).join(' ') || '';
            
//             setFormData({
//                 firstName,
//                 lastName,
//                 email: user.email || '',
//                 phone: user.phoneNumber || ''
//             });
//         }
//     }, [user]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
        
//         try {
//             // Firebase profile update
//             await updateProfile(auth.currentUser, {
//                 displayName: `${formData.firstName} ${formData.lastName}`.trim(),
//                 // phoneNumber: formData.phone // Firebase phone update আলাদা function
//             });
            
//             setSuccess(true);
//             setTimeout(() => setSuccess(false), 3000);
//             console.log('✅ Profile updated successfully');
            
//         } catch (error) {
//             console.error('❌ Profile update error:', error);
//             alert('Failed to update profile: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Email verification status
    // const getEmailStatus = () => {
    //     if (!user?.email) return null;
        
    //     if (user.emailVerified) {
    //         return <FaCheckCircle className="text-green-500 text-xl mr-3" />;
    //     } else {
    //         return (
    //             <div className="mr-3 flex items-center gap-1">
    //                 <span className="text-xs text-red-500">Not Verified</span>
    //                 {/* <button 
    //                     onClick={() => {}}
    //                     className="text-xs text-blue-500 hover:underline ml-1"
    //                 >
    //                     Verify
    //                 </button> */}
    //             </div>
    //         );
    //     }
    // };

//     return (
//         <div className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto">
//             <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#5D4F52] border-b border-[#E5E7EB] pb-3">
//                 <FaUser className="text-[#01788E]" /> Contact Information
//             </h2>

//             {/* Success Message */}
//             {success && (
//                 <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
//                     <p className="text-green-600 text-sm flex items-center gap-2">
//                         <FaCheckCircle className="text-green-500" />
//                         Profile updated successfully!
//                     </p>
//                 </div>
//             )}

//             <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* First Name */}
//                 <div className="flex flex-col gap-2">
//                     <label className="text-sm text-gray-600">First Name</label>
//                     <input
//                         type="text"
//                         name="firstName"
//                         value={formData.firstName}
//                         onChange={handleChange}
//                         placeholder="First Name"
//                         className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
//                     />
//                 </div>

//                 {/* Last Name */}
//                 <div className="flex flex-col gap-2">
//                     <label className="text-sm text-gray-600">Last Name</label>
//                     <input
//                         type="text"
//                         name="lastName"
//                         value={formData.lastName}
//                         onChange={handleChange}
//                         placeholder="Last Name"
//                         className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
//                     />
//                 </div>
//             </div>

//             <div className="md:flex items-center gap-6">
//                 {/* Email Section */}
//                 <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
//                     <label className="text-sm text-gray-600">Email</label>
                    
//                     <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F8F8F8]">
//                         <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             readOnly // Email সাধারণত update করা যায় না
//                             className="px-4 py-2 outline-none bg-transparent flex-1 text-gray-700"
//                         />
                        
//                         {/* Email Status */}
//                         {getEmailStatus()}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                         Email cannot be changed. Contact support if needed.
//                     </p>
//                 </div>

//                 {/* Phone */}
//                 <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
//                     <label className="text-sm text-gray-600">Phone</label>
                    
//                     <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F8F8F8]">
//                         {/* Flag */}
//                         <div className="px-4 py-2 flex items-center gap-2 border-r border-[#E5E7EB] bg-white">
//                             <img
//                                 src="https://flagcdn.com/w20/bd.png"
//                                 alt="BD Flag"
//                                 className="w-5 h-4 object-cover"
//                             />
//                             <span className="text-gray-700 text-sm">+880</span>
//                         </div>

//                         {/* Phone Number */}
//                         <input
//                             type="tel"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleChange}
//                             placeholder="1XXXXXXXXXX"
//                             className="px-4 py-2 outline-none bg-transparent flex-1"
//                         />
                        
//                         {/* Success Icon */}
//                         {formData.phone && (
//                             <FaCheckCircle className="text-green-500 text-xl mr-3" />
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Button */}
//             <div className="mt-10 flex justify-center">
//                 <button 
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     className={`bg-[#F26B2B] text-white font-semibold px-10 py-2 rounded-md hover:bg-[#e26227] transition flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
//                 >
//                     {loading ? (
//                         <>
//                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                             Updating...
//                         </>
//                     ) : (
//                         'UPDATE'
//                     )}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default UserProfile;