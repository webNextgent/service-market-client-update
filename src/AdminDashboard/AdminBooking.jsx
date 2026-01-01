import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaCalendarAlt, FaRegEye, FaRegEdit, FaRegTrashAlt, FaMapMarkerAlt, FaShare, FaExternalLinkAlt, FaCopy, FaWhatsapp, FaEnvelope, FaUser, FaPhone, FaDollarSign, FaChevronLeft, FaChevronRight, FaMap, FaLink } from "react-icons/fa";
import { IoClose, IoCopyOutline } from "react-icons/io5";

const AdminBooking = () => {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [copied, setCopied] = useState(false);
    const [mapLinkCopied, setMapLinkCopied] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [viewMode, setViewMode] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [demoMode,] = useState(true);
    const shareRef = useRef(null);

    // Fetch Bookings
    const { data: bookings = [], isLoading, error } = useQuery({
        queryKey: ["bookingAdmin"],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/booking`);
            if (!res.ok) throw new Error("Failed to fetch bookings");
            const bookingRes = await res.json();
            return bookingRes.Data || [];
        },
        retry: 2,
        staleTime: 1000 * 60 * 5,
    });

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShareOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter bookings
    const filteredBookings = bookings.filter(book => {
        if (!book) return false;

        const matchesSearch =
            book.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.id?.toString().includes(searchTerm) ||
            book.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || book.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Handle booking update
    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/update/${selectedBooking.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: selectedBooking.status,
                        address: selectedBooking.address,
                        date: selectedBooking.date,
                        time: selectedBooking.time,
                        totalPay: selectedBooking.totalPay
                    }),
                }
            );

            const data = await res.json();
            if (data.success) {
                queryClient.invalidateQueries(["bookingAdmin"]);
                setSelectedBooking(null);
                alert("✅ Booking updated successfully!");
            } else {
                alert("Failed to update booking");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong!");
        }
    };

    // Handle booking deletion
    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
            return;
        }
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/delete/${bookingId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();
            if (data.success) {
                queryClient.invalidateQueries(["bookingAdmin"]);
                alert("✅ Booking deleted successfully!");
            } else {
                alert("Failed to delete booking");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong!");
        }
    };

    // Handle input changes in edit modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedBooking(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Get status color class
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-50 text-green-700 border border-green-200';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
            case 'upcoming': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'unpaid': return 'bg-orange-50 text-orange-700 border border-orange-200';
            case 'onhold': return 'bg-gray-50 text-gray-700 border border-gray-200';
            default: return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    // Get Google Maps URL with actual coordinates
    const getGoogleMapsUrl = useCallback((booking) => {
        // First priority: actual coordinates from booking
        if (booking?.latitude && booking?.longitude) {
            return `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`;
        }

        // Second priority: generate demo coordinates based on booking ID
        if (demoMode && booking?.id) {
            // Generate consistent coordinates based on booking id
            const idNum = parseInt(booking.id) || Math.floor(Math.random() * 1000);
            const lat = 23.8103 + (idNum % 100) * 0.01;
            const lng = 90.4125 + (idNum % 100) * 0.01;
            return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        }

        // Third priority: use address for search
        if (booking?.address) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;
        }

        return 'https://www.google.com/maps';
    }, [demoMode]);

    // Get REAL coordinates from booking data
    const getCoordinates = useCallback((booking) => {
        if (!booking) return { latitude: 23.8103, longitude: 90.4125 };
        
        // Priority 1: Use real coordinates from booking
        if (booking.latitude && booking.longitude) {
            return {
                latitude: Number(booking.latitude),
                longitude: Number(booking.longitude)
            };
        }
        
        // Priority 2: Generate coordinates based on booking ID (fallback)
        let idNum;
        if (booking.id) {
            const numMatch = booking.id.toString().match(/\d+/);
            idNum = numMatch ? parseInt(numMatch[0]) : Math.floor(Math.random() * 1000);
        } else {
            idNum = Math.floor(Math.random() * 1000);
        }
        
        const lat = 23.8103 + (idNum % 100) * 0.01;
        const lng = 90.4125 + (idNum % 100) * 0.01;
        
        return {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6))
        };
    }, []);

    // Get Map Image URL - Using OpenStreetMap (No API Key Required)
    // const getMapImageUrl = useCallback((booking) => {
    //     // Get coordinates
    //     const coords = getCoordinates(booking);
        
    //     // Use OpenStreetMap static map
    //     return `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.latitude},${coords.longitude}&zoom=14&size=600x300&maptype=mapnik&markers=${coords.latitude},${coords.longitude},red-pushpin`;
    // }, [getCoordinates]);

    // WhatsApp/share-friendly version with better formatting
    const generateShareText = (booking) => {
        const mapUrl = getGoogleMapsUrl(booking);

        const lines = [
            "📋 *BOOKING DETAILS* 📋",
            "━━━━━━━━━━━━━━━━━━━━",
            "",
            `🔹 *ID:* ${booking.id}`,
            `🔹 *Service:* ${booking.serviceName}`,
            `🔹 *Date & Time:* ${booking.date} at ${booking.time}`,
            `🔹 *Amount:* $${booking.totalPay}`,
            `🔹 *Status:* ${booking.status}`,
            "",
            "📍 *LOCATION*",
            `Address: ${booking.address}`,
            `Map: ${mapUrl}`,
            "",
            booking.customerName ? `👤 *Customer:* ${booking.customerName}` : "",
            booking.phone ? `📞 *Phone:* ${booking.phone}` : "",
            "",
            booking.additionalInfo ? `📝 *Additional Notes:*\n${booking.additionalInfo}` : "",
            "",
            "━━━━━━━━━━━━━━━━━━━━",
            "📍 Tap the map link above to view location"
        ];

        // Filter out empty lines and join
        return lines.filter(line => line !== "").join("\n");
    };

    // Handle share actions
    const handleShare = (method) => {
        if (!bookingDetails) return;

        const shareText = generateShareText(bookingDetails);

        switch (method) {
            case 'copy':
                navigator.clipboard.writeText(shareText).then(() => {
                    setCopied(true);
                    setShowShareOptions(false);
                    setTimeout(() => setCopied(false), 2000);
                });
                break;

            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                setShowShareOptions(false);
                break;
        }
    };

    // Copy map link to clipboard
    const handleCopyMapLink = () => {
        if (!bookingDetails) return;

        const mapUrl = getGoogleMapsUrl(bookingDetails);
        navigator.clipboard.writeText(mapUrl).then(() => {
            setMapLinkCopied(true);
            setTimeout(() => setMapLinkCopied(false), 2000);
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Calculate statistics
    const totalRevenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.totalPay) || 0), 0);
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Error loading bookings</p>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => queryClient.refetchQueries(["bookingAdmin"])}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-300 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                        <p className="text-gray-600 mt-2">
                            {bookings.length} total bookings • {completedBookings} completed • {formatCurrency(totalRevenue)} revenue
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            {viewMode === "table" ? "📱 Card View" : "📋 Table View"}
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <IoClose className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="OnHold">On Hold</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-40">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="20">20 per page</option>
                                <option value="50">50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Content */}
            {viewMode === "table" ? (
                <>
                    {/* Table View */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            No
                                        </th>
                                        <th className="py-5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Service & Amount
                                        </th>
                                        <th className="py-5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Schedule
                                        </th>
                                        <th className="py-5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Location
                                        </th>
                                        <th className="py-5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-16 text-center">
                                                <div className="text-gray-300 mb-4">
                                                    <FaCalendarAlt className="w-16 h-16 mx-auto" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No bookings found</p>
                                                <p className="text-gray-400 mt-2">
                                                    {searchTerm ? 'Try adjusting your search' : 'No bookings available'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentBookings.map((book, idx) => (
                                            <tr
                                                key={book.id}
                                                className="hover:bg-gray-50/80 transition-colors duration-200 group"
                                            >
                                                <td className="px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <div className="font-mono text-sm font-semibold text-gray-900">
                                                                #{idx + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 mb-1">
                                                            {book.serviceName}
                                                        </div>
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {formatCurrency(book.totalPay)}
                                                        </div>
                                                        {book.customerName && (
                                                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                                                <FaUser className="w-3 h-3" />
                                                                {book.customerName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 text-gray-900">
                                                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium">{book.date}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 pl-7">
                                                            {book.time}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="max-w-[250px]">
                                                        <div className="flex items-start gap-2 text-gray-700">
                                                            <FaMapMarkerAlt className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                                                            <span className="line-clamp-2">{book.address}</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button
                                                                onClick={() => setBookingDetails(book)}
                                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                            >
                                                                <FaMap className="w-3 h-3" />
                                                                View on Map
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setBookingDetails(book)}
                                                            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                                                            title="View Details"
                                                        >
                                                            <FaRegEye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedBooking(book)}
                                                            className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
                                                            title="Edit"
                                                        >
                                                            <FaRegEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBooking(book.id)}
                                                            className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                                                            title="Delete"
                                                        >
                                                            <FaRegTrashAlt className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredBookings.length > 0 && (
                            <div className="px-6 py-5 border-t border-gray-200 bg-gray-50/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredBookings.length)}</span> of{" "}
                                        <span className="font-semibold">{filteredBookings.length}</span> bookings
                                        <span className="ml-4 text-gray-400">•</span>
                                        <span className="ml-4">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span></span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`p-2.5 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <FaChevronLeft className="w-4 h-4" />
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`p-2.5 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <FaChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Card View */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {currentBookings.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-200">
                                <div className="text-gray-300 mb-4">
                                    <FaCalendarAlt className="w-20 h-20 mx-auto" />
                                </div>
                                <p className="text-gray-500 font-medium text-lg">No bookings found</p>
                                <p className="text-gray-400 mt-2">
                                    {searchTerm ? 'Try adjusting your search' : 'No bookings available'}
                                </p>
                            </div>
                        ) : (
                            currentBookings.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6 w-full">
                                        {/* Header with Status and ID */}
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(book.status)}`}>
                                                    {book.status}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-2">ID: {book.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(book.totalPay)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Name */}
                                        <h3 className="font-semibold text-gray-900 text-lg mb-4 line-clamp-1">{book.serviceName}</h3>

                                        {/* Customer Info if available */}
                                        {book.customerName && (
                                            <div className="flex items-center gap-3 text-gray-600 mb-5 p-3 bg-gray-50 rounded-lg">
                                                <FaUser className="w-4 h-4" />
                                                <div>
                                                    <p className="font-medium">{book.customerName}</p>
                                                    {book.phone && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <FaPhone className="w-3 h-3" />
                                                            {book.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Schedule and Location */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{book.date}</p>
                                                    <p className="text-sm text-gray-600">{book.time}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                                                <div className="p-2 bg-green-50 rounded-lg">
                                                    <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 line-clamp-2">{book.address}</p>
                                                    <button
                                                        onClick={() => setBookingDetails(book)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                                                    >
                                                        View on Map →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                                            <button
                                                onClick={() => setBookingDetails(book)}
                                                className="flex-1 py-3 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => setSelectedBooking(book)}
                                                className="flex-1 py-3 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination for Card View */}
                    {filteredBookings.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredBookings.length)}</span> of{" "}
                                    <span className="font-semibold">{filteredBookings.length}</span> bookings
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2.5 rounded-lg font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage === 1) {
                                                pageNum = i + 1;
                                            } else if (currentPage === totalPages) {
                                                pageNum = totalPages - 2 + i;
                                            } else {
                                                pageNum = currentPage - 1 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2.5 rounded-lg font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Edit Booking Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 border-b border-gray-200">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Edit Booking</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                    <p className="text-sm text-gray-600">ID: {selectedBooking.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-7 space-y-7 overflow-y-auto flex-1">
                            {/* Service and Amount */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Service Name
                                    </label>
                                    <input
                                        type="text"
                                        name="serviceName"
                                        value={selectedBooking.serviceName || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter service name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Total Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                        <input
                                            type="number"
                                            name="totalPay"
                                            value={selectedBooking.totalPay || ""}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status and Schedule */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={selectedBooking.status || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="Pending">⏳ Pending</option>
                                        <option value="Upcoming">📅 Upcoming</option>
                                        <option value="Completed">✅ Completed</option>
                                        <option value="Cancelled">❌ Cancelled</option>
                                        <option value="Unpaid">💰 Unpaid</option>
                                        <option value="OnHold">⏸️ On Hold</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={selectedBooking.date || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={selectedBooking.time || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>  

                            {/* Address with Map Preview */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Address
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {selectedBooking.latitude && selectedBooking.longitude && (
                                            <span className="text-xs text-green-600">
                                                📍 {selectedBooking.latitude}, {selectedBooking.longitude}
                                            </span>
                                        )}
                                        <a
                                            href={getGoogleMapsUrl(selectedBooking)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                                        >
                                            <FaExternalLinkAlt className="w-3 h-3" />
                                            Open in Maps
                                        </a>
                                    </div>
                                </div>
                                <textarea
                                    name="address"
                                    value={selectedBooking.address || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="Enter full address including city, state, and zip code..."
                                />

                                {/* Map Preview */}
                                {/* <div className="mt-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h4 className="text-sm font-semibold text-gray-800">Location Preview</h4>
                                        <div className="h-px flex-1 bg-gray-200"></div>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden border border-gray-300">
                                        {selectedBooking.latitude && selectedBooking.longitude ? (
                                            <img
                                                src={getMapImageUrl(selectedBooking)}
                                                alt="Location Map"
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://via.placeholder.com/600x300/cccccc/808080?text=Map+Preview`;
                                                }}
                                            />
                                        ) : (
                                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                                <p className="text-gray-500">No coordinates available</p>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                                            📍 {selectedBooking.address ? selectedBooking.address.substring(0, 30) + '...' : 'Location'}
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            {/* Additional Information */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="additionalInfo"
                                    value={selectedBooking.additionalInfo || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="Any special instructions, requirements, or notes..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-4 p-7 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateBooking}
                                className="px-6 py-3.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors font-semibold shadow-sm hover:shadow"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Modal - WITH REAL MAP */}
            {bookingDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 border-b border-gray-200">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(bookingDetails.status)}`}>
                                        {bookingDetails.status}
                                    </span>
                                    <p className="text-sm text-gray-600">ID: {bookingDetails.id}</p>
                                    <p className="text-sm text-gray-600">•</p>
                                    <p className="text-sm text-gray-600">
                                        <span className="block md:inline">{bookingDetails.date}</span>
                                        <span className="block md:inline"> {bookingDetails.time}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setBookingDetails(null)}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-7 space-y-8 overflow-y-auto flex-1">
                            {/* Service and Payment Section */}
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Service Information */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <FaCalendarAlt className="w-4 h-4" />
                                            Service Information
                                        </h4>
                                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-2xl font-bold text-gray-900 mb-3">{bookingDetails.serviceName}</p>
                                            <div className="space-y-3">
                                                {bookingDetails.customerName && (
                                                    <div className="flex items-center gap-3">
                                                        <FaUser className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{bookingDetails.customerName}</p>
                                                            {bookingDetails.phone && (
                                                                <p className="text-sm text-gray-600 mt-1">{bookingDetails.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{bookingDetails.date}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{bookingDetails.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <FaDollarSign className="w-4 h-4" />
                                            Payment Information
                                        </h4>
                                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-gray-600">Total Amount</p>
                                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(bookingDetails.totalPay)}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-600">Payment Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bookingDetails.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                    {bookingDetails.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Section with REAL MAP */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <FaMapMarkerAlt className="w-4 h-4" />
                                                Location
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCopyMapLink}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <IoCopyOutline className="w-4 h-4" />
                                                    {mapLinkCopied ? 'Copied!' : 'Copy Link'}
                                                </button>
                                                <a
                                                    href={getGoogleMapsUrl(bookingDetails)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                                                >
                                                    <FaExternalLinkAlt className="w-4 h-4" />
                                                    Open Map
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                                            <p className="text-gray-700 whitespace-pre-wrap">{bookingDetails.address}</p>
                                         
                                        </div>

                                        {/* REAL MAP PREVIEW - OpenStreetMap */}
                                        <div className="relative rounded-xl overflow-hidden border border-gray-300">
                                            {bookingDetails.latitude && bookingDetails.longitude ? (
                                                <iframe
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bookingDetails.longitude - 0.01},${bookingDetails.latitude - 0.01},${bookingDetails.longitude + 0.01},${bookingDetails.latitude + 0.01}&layer=mapnik&marker=${bookingDetails.latitude},${bookingDetails.longitude}`}
                                                    width="100%"
                                                    height="200"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="Location Map"
                                                ></iframe>
                                            ) : (
                                                <div className="h-48 bg-gray-100 flex items-center justify-center">
                                                    <p className="text-gray-500">No coordinates available for map</p>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                        
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {bookingDetails.additionalInfo && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Additional Information</h4>
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {bookingDetails.additionalInfo}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 p-7 border-t border-gray-200">
                            {/* Share Button */}
                            <div className="relative" ref={shareRef}>
                                <button
                                    onClick={() => setShowShareOptions(!showShareOptions)}
                                    className="flex items-center gap-3 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    <FaShare className="w-4 h-4" />
                                    Share Booking
                                    {copied && (
                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg shadow">
                                            Copied!
                                        </span>
                                    )}
                                </button>

                                {showShareOptions && (
                                    <div className="absolute bottom-full left-0 mb-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                                        <div className="p-2">
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <FaCopy className="text-gray-600" />
                                                <div>
                                                    <p className="font-semibold">Copy Details</p>
                                                    <p className="text-xs text-gray-500">Text to clipboard</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleShare('whatsapp')}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <FaWhatsapp className="text-green-500" />
                                                <div>
                                                    <p className="font-semibold">WhatsApp</p>
                                                    <p className="text-xs text-gray-500">Share via WhatsApp</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setBookingDetails(null)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-semibold"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBooking(bookingDetails);
                                        setBookingDetails(null);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors font-semibold shadow-sm hover:shadow"
                                >
                                    Edit Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooking;