
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export default function LoginModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [fullPhoneNumber, setFullPhoneNumber] = useState("");
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [validationError, setValidationError] = useState("");
    const inputRefs = useRef([]);
    const { setUser } = useAuth();

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setPhone("");
            setFullPhoneNumber("");
            setOtp(['', '', '', '']);
            setOtpSuccessModal(false);
            setValidationError("");
            setSelectedCountry(null);
        }
    }, [open]);

    // Countdown logic
    useEffect(() => {
        if (timer > 0 && otpSuccessModal) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, otpSuccessModal]);

    // Handle OTP input change
    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }

        // Auto submit if all fields are filled
        if (newOtp.every(digit => digit !== '') && index === 3) {
            handleVerifyOtp();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];

            if (newOtp[index]) {
                // Clear current input if it has value
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1].focus();
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle phone number change with country validation
    const handlePhoneChange = (value, country) => {
        setPhone(value);
        setSelectedCountry(country);
        setValidationError(""); // Clear validation error when user types
    };

    // Validate phone number based on country
    const validatePhoneNumber = () => {
        if (!phone) {
            setValidationError("Please enter phone number");
            return false;
        }

        // Remove country code to get actual number length
        const countryCode = selectedCountry?.dialCode || "971";
        let phoneWithoutCode;

        // Handle cases where phone might not start with country code
        if (phone.startsWith(countryCode)) {
            phoneWithoutCode = phone.substring(countryCode.length);
        } else {
            phoneWithoutCode = phone;
        }

        // Minimum length validation
        if (phoneWithoutCode.length < 4) {
            setValidationError("Please enter a valid phone number");
            return false;
        }

        // Remove any non-digit characters for validation
        const digitsOnly = phoneWithoutCode.replace(/\D/g, '');

        // Country-specific validations
        if (selectedCountry?.countryCode === 'ae' && digitsOnly.length !== 9) {
            setValidationError("UAE phone numbers must be 9 digits");
            return false;
        }

        if (selectedCountry?.countryCode === 'us' && digitsOnly.length !== 10) {
            setValidationError("US phone numbers must be 10 digits");
            return false;
        }

        // General validation for other countries
        if (digitsOnly.length < 6) {
            setValidationError("Phone number is too short");
            return false;
        }

        return true;
    };

    const handleContinue = async () => {
        if (!validatePhoneNumber()) {
            return;
        }

        setLoading(true);
        const fullPhone = "+" + phone;
        setFullPhoneNumber(fullPhone);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: fullPhone,
                    countryCode: selectedCountry?.countryCode || 'ae',
                    countryName: selectedCountry?.name || 'United Arab Emirates'
                })
            });

            const data = await response.json();

            if (data?.success === false) {
                toast.error(data?.message || 'Failed to send OTP. Please try again.');
            } else {
                setOtpSuccessModal(true);
                setTimer(30);
                setResendDisabled(true);
                toast.success("OTP sent successfully!");

                // Auto focus first OTP input
                setTimeout(() => {
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            // toast.error("Please enter 4-digit OTP");
            return;
        }

        setVerifyingOtp(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: fullPhoneNumber,
                    otp: otpString
                })
            });

            const data = await response.json();


            if (data?.success === true) {
                const token = data?.Data?.token;
                if (token) {
                    localStorage.setItem('access-token', token);
                    toast.success("Verification successful! Welcome!");
                    onClose();
                    const decoded = jwtDecode(token);
                    setUser(decoded);
                }
            } else {
                localStorage.removeItem("access-token");
                setUser(null);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendDisabled) return;

        setResendDisabled(true);
        setTimer(30);
        setOtp(['', '', '', '']);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: fullPhoneNumber,
                    via: 'sms'
                })
            });

            const data = await response.json();

            if (data?.success === false) {
                toast.error(data?.message || 'Failed to resend OTP');
                setResendDisabled(false);
            } else {
                toast.success("OTP resent successfully!");
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Failed to resend OTP');
            setResendDisabled(false);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);
        const digits = pastedData.replace(/\D/g, '').split('');

        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            if (index < 4) {
                newOtp[index] = digit;
            }
        });

        setOtp(newOtp);

        // Focus last filled input
        const lastFilledIndex = Math.min(digits.length - 1, 3);
        if (inputRefs.current[lastFilledIndex]) {
            inputRefs.current[lastFilledIndex].focus();
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white md:h-full max-w-md rounded-2xl shadow-xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {!otpSuccessModal ? (
                    // Phone Input View
                    <>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 z-10"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="p-8 pb-6">
                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                Log in or sign up
                            </h2>
                            <p className="text-gray-600 text-center mb-8">
                                Please enter your mobile number to proceed.
                            </p>

                            {/* Phone Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Mobile Number
                                </label>

                                <div className="relative">
                                    <PhoneInput
                                        country={"ae"}
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        enableSearch={true}
                                        searchPlaceholder="Search country..."
                                        inputStyle={{
                                            width: "100%",
                                            height: "56px",
                                            borderRadius: "10px",
                                            border: validationError ? "2px solid #ef4444" : "1px solid #d1d5db",
                                            background: "#FFFFFF",
                                            fontSize: "16px",
                                            paddingLeft: "60px",
                                            transition: "border-color 0.2s ease",
                                        }}
                                        buttonStyle={{
                                            borderRadius: "12px 0 0 12px",
                                            border: validationError ? "2px solid #ef4444" : "1px solid #d1d5db",
                                            borderRight: "none",
                                            background: "#FFFFFF",
                                            padding: "0 12px",
                                            transition: "border-color 0.2s ease",
                                        }}
                                        dropdownStyle={{
                                            borderRadius: "12px",
                                            marginTop: "8px",
                                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                            zIndex: 9999,
                                        }}
                                        containerStyle={{
                                            marginTop: "4px",
                                        }}
                                        searchStyle={{
                                            padding: "12px",
                                            fontSize: "14px",
                                            margin: "8px",
                                            borderRadius: "8px",
                                            border: "1px solid #d1d5db",
                                            width: "calc(100% - 16px)",
                                        }}
                                        placeholder="Phone number"
                                        specialLabel=""
                                        inputProps={{
                                            "aria-label": "Phone number input",
                                            "data-testid": "phone-input"
                                        }}
                                    />

                                    {validationError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {validationError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                disabled={loading || !phone}
                                onClick={handleContinue}
                                className={`w-full bg-[#F26822] text-white font-bold py-4 rounded-xl transition-all duration-200 text-lg
                                    ${loading || !phone ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e05c18] hover:shadow-md active:scale-[0.98]'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        SENDING...
                                    </span>
                                ) : (
                                    'CONTINUE'
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    // OTP Verification View
                    <div className="p-8">
                        {/* Header Controls */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => setOtpSuccessModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 group"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 hidden sm:inline">
                                    Back
                                </span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                            </button>
                        </div>

                        {/* Title & Description */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify mobile number</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We've sent an OTP via SMS to <span className="font-bold text-gray-900">{fullPhoneNumber}</span>.
                                Please enter the 4-digit code below.
                            </p>
                        </div>

                        {/* OTP Input Group */}
                        <div className="mb-10">
                            <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-16 h-20 text-3xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-[#F26822] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50"
                                        disabled={verifyingOtp}
                                        aria-label={`Digit ${index + 1} of OTP`}
                                        data-testid={`otp-input-${index}`}
                                    />
                                ))}
                            </div>

                            {/* Timer and Resend */}
                            <div className="text-center mt-6">
                                {resendDisabled ? (
                                    <p className="text-gray-600">
                                        Resend OTP in <span className="font-bold text-gray-900">00:{timer.toString().padStart(2, '0')}</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        className="text-[#F26822] font-medium hover:text-[#e05c18] transition-colors inline-flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Resend OTP via SMS
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otp.join('').length !== 4}
                            className={`w-full bg-[#F26822] text-white font-bold py-4 rounded-xl transition-all duration-200 text-lg mb-6
                                ${verifyingOtp || otp.join('').length !== 4 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e05c18] hover:shadow-md active:scale-[0.98]'}`}
                        >
                            {verifyingOtp ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    VERIFYING...
                                </span>
                            ) : (
                                'VERIFY OTP'
                            )}
                        </button>

                        {/* Edit Phone Number */}
                        <div className="text-center">
                            <button
                                onClick={() => setOtpSuccessModal(false)}
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Use different phone number
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};