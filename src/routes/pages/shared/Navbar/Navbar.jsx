import { Link } from "react-router-dom";
import logo from "../../../../assets/logo/logo.png";
import { useState, useRef, useEffect } from "react";
import LoginModal from "../../../../components/LoginModal/LoginModal";
import useAuth from "../../../../hooks/useAuth";

const Navbar = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { user, logOut } = useAuth();
    console.log(user);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Toggle dropdown on mobile/tablet
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md md:px-12 navbar md:flex md:justify-center md:items-center">
                <div className="navbar-start flex items-center">
                    <div className="dropdown">
                        <Link className="block lg:hidden" to="/">
                            <img
                                className="w-[133px] h-[33px]"
                                src={logo}
                                alt="Logo"
                            />
                        </Link>
                    </div>

                    <Link className="hidden lg:block" to="/">
                        <img
                            className="w-[133px] h-[33px]"
                            src={logo}
                            alt="Logo"
                        />
                    </Link>
                </div>

                <div className="navbar-end hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {/* {links} */}
                    </ul>
                </div>

                <div className="navbar-end mr-4 md:w-[100px]" ref={dropdownRef}>
                    {user ? (
                        <div className="relative group">
                            <button
                                onClick={toggleDropdown}
                                className="btn bg-white text-gray-500 border shadow-xs"
                            >
                                {user?.role}
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`
                                absolute top-12 right-0 mt-1 w-60 bg-white shadow-lg rounded-xl p-2
                                lg:top-7
                                ${dropdownOpen ? 'block' : 'hidden'}
                                lg:block
                                lg:opacity-0 lg:group-hover:opacity-100 
                                lg:pointer-events-none lg:group-hover:pointer-events-auto
                                transition-all duration-200
                                z-50
                            `}>
                                <Link
                                    to={user?.role === 'ADMIN' ? "/dashboard/admin-booking" : "/dashboard/booking"}
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Dashboard
                                </Link>

                                <button
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                    onClick={async () => {
                                        await logOut();
                                        setDropdownOpen(false);
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <Link
                                // to='/login'
                                onClick={() => setOpenModal(true)}
                                className="btn bg-white text-[#5D4F52] border shadow-xs font-bold">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔹 Spacer div — so content doesn't go under navbar */}
            <div className="h-10 md:h-[70px]"></div>
            <LoginModal open={openModal} onClose={() => setOpenModal(false)} />
        </>
    );
};

export default Navbar;