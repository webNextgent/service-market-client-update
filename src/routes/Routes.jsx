import Main from "../layout/Main";
import Home from "./pages/Home/Home/Home";
import Address from "./pages/Address/Address";
import DateTime from "./pages/DateTime/DateTime";
import Confirmation from "./pages/Confirmation/Confirmation";
import UserDashboard from "../layout/UserDashboard";
import UserBooking from "../UserDashboard/UserBooking";
import UserProfile from "../UserDashboard/UserProfile";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess";
import SavedLocations from "../UserDashboard/SaveLocations";
import PaymentMethods from "../UserDashboard/PaymentMethods";
import MyWallet from "../UserDashboard/MyWallet";
import DeleteAccount from "../UserDashboard/DeleteAccount";
import InviteFriend from "../UserDashboard/InviteFriend";
import BookingDetails from "./pages/BookingDetails/BookingDetails";
import AddServices from "../AdminDashboard/AddServices";
import AdminBooking from "../AdminDashboard/AdminBooking";
import AddServiceType from "../AdminDashboard/AddServiceType";
import AddPropertyType from "../AdminDashboard/AddPropertyType";
import AddPropertyItem from "../AdminDashboard/AddPropertyItem";
import AdminDateTime from "../AdminDashboard/AdminDateTime";
import LocationPicker from "./pages/LocationPicker/LocationPicker";
import { createBrowserRouter } from "react-router-dom";
import AddPromoCode from "../AdminDashboard/AddPromoCode";
import axiosSecure from "../utils/axiosSecure";
import ProtectedRoute from "./ProtectedRoute";
import UserManagement from "../AdminDashboard/UserManagement";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
        children: [
            { path: '/', element: <Home /> },
            { path: 'location', element: <ProtectedRoute><LocationPicker /></ProtectedRoute> },
            { path: 'address', element: <ProtectedRoute><Address /> </ProtectedRoute> },
            { path: 'date-time', element: <ProtectedRoute><DateTime /></ProtectedRoute> },
            { path: 'confirmation', element: <ProtectedRoute> <Confirmation /> </ProtectedRoute> },
            { path: 'booking-success', element: <ProtectedRoute> <BookingSuccess /></ProtectedRoute> },
            {
                path: "/booking-details/:id",
                element: <ProtectedRoute> <BookingDetails /></ProtectedRoute>,
                loader: async ({ params }) => {
                    const res = await axiosSecure.get(`/booking/${params.id}`);
                    return res.data;
                }
            },
        ]
    },
    {
        path: 'dashboard',
        element: <UserDashboard />,
        children: [
            { path: 'booking', element: <ProtectedRoute> <UserBooking /></ProtectedRoute> },
            { path: 'profile', element: <ProtectedRoute> <UserProfile /></ProtectedRoute> },
            { path: 'saved-locations', element: <ProtectedRoute> <SavedLocations /></ProtectedRoute> },
            { path: 'payment-methods', element: <ProtectedRoute> <PaymentMethods /></ProtectedRoute> },
            { path: 'wallet', element: <ProtectedRoute><MyWallet /> </ProtectedRoute> },
            { path: 'delete-account', element: <ProtectedRoute> <DeleteAccount /></ProtectedRoute> },
            { path: 'invite-friend', element: <ProtectedRoute><InviteFriend /></ProtectedRoute> },

            // admin routes 
            { path: 'add-services', element: <AddServices /> },
            { path: 'admin-booking', element: <AdminBooking /> },
            { path: 'add-service-type', element: <AddServiceType /> },
            { path: 'add-property-type', element: <AddPropertyType /> },
            { path: 'add-property-item', element: <AddPropertyItem /> },
            { path: 'add-promo-code', element: <AddPromoCode /> },
            { path: 'admin-date-time', element: <AdminDateTime /> },
            { path: 'user-management', element: <UserManagement /> },
        ]
    }
]);