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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md md:px-12 navbar md:flex md:justify-center md:items-center">
                {/* Left */}
                <div className="navbar-start flex items-center">
                    <Link className="block lg:hidden" to="/">
                        <img
                            className="w-[133px] h-[33px]"
                            src={logo}
                            alt="Logo"
                        />
                    </Link>

                    <Link className="hidden lg:block" to="/">
                        <img
                            className="w-[133px] h-[33px]"
                            src={logo}
                            alt="Logo"
                        />
                    </Link>
                </div>

                {/* Middle */}
                <div className="navbar-end hidden lg:flex">
                    <ul className="menu menu-horizontal px-1"></ul>
                </div>

                {/* Right */}
                <div className="navbar-end mr-4 md:w-[100px]" ref={dropdownRef}>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="btn bg-white text-gray-500 border shadow-xs"
                            >
                                {user?.name || user?.role}
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute top-12 right-0 mt-1 w-60 bg-white shadow-lg rounded-xl p-2 z-50">
                                    {user?.role === "USER" ? (
                                        <>
                                            <Link
                                                to="/dashboard/booking"
                                                className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                My Booking
                                            </Link>

                                            <Link
                                                to="/dashboard/profile"
                                                className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                My Profile
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
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/dashboard/admin-booking"
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
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => setOpenModal(true)}
                                className="btn bg-white text-[#5D4F52] border shadow-xs font-bold"
                            >
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer */}
            <div className="h-10 md:h-[70px]"></div>

            <LoginModal open={openModal} onClose={() => setOpenModal(false)} />
        </>
    );
};

export default Navbar;
