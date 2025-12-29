import { createContext, useContext, useEffect, useRef, useState } from "react";
import useAllServices from "../hooks/useAllServices";
import useCoverContent from "../hooks/useCoverContent";
import useButton from "../hooks/useButton";
import { useItem } from "./ItemProvider";
import { useQueries } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
    const observer = useRef(null);
    const { data } = useItem();
    const [services] = useAllServices();
    const [content] = useCoverContent();
    const [button] = useButton();
    const [showInput, setShowInput] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [addressLocation, setAddressLocation] = useState(null);
    const [mapLatitude, setMapLatitude] = useState("");
    const [mapLongitude, setMapLongitude] = useState("");
    const [liveAddress, setLiveAddress] = useState("");
    const [useDiscount, setUseDiscount] = useState(0);
    const [promo, setPromo] = useState("");
    const [promoStatus, setPromoStatus] = useState(false);

    const [saveAddress, setSaveAddress] = useState(() => {
        const stored = localStorage.getItem("saveAddress");
        if (!stored) return [];

        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error("Invalid saveAddress in localStorage:", stored);
            localStorage.removeItem("saveAddress");
            return [];
        }
    });


    // for promo code
    const handleApply = async (promoCode) => {
        try {
            const res = await fetch('https://job-task-nu.vercel.app/api/v1/promo-code/use-promo-code/6947c2d395c2c51a68b5414f', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoCode }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result?.message || "Invalid promo code");
                return;
            }

            setPromo(promoCode);
            setPromoStatus(true);
            setUseDiscount(Number(result?.Data?.discount || 0));
            toast.success("Promo applied successfully");
        } catch {
            toast.error("Something went wrong");
        }
    };

    useEffect(() => {
        localStorage.setItem("saveAddress", JSON.stringify(saveAddress));
    }, [saveAddress]);

    useEffect(() => {
        const sections = document.querySelectorAll("[id^='content-']");
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const visibleId = entry.target.getAttribute("id").replace("content-", "");
                        setActiveId(visibleId);
                    }
                });
            },
            { threshold: 0.5 }
        );
        sections.forEach((section) => observer.current.observe(section));
        return () => {
            if (observer.current) {
                sections.forEach((section) => observer.current.unobserve(section));
            }
        };
    }, [content]);

    const itemQueries = useQueries({
        queries: data.map((id) => ({
            queryKey: ["item-summary", id],
            queryFn: async () => {
                const res = await fetch(
                    `https://job-task-nu.vercel.app/api/v1/property-items/${id}`
                );
                const json = await res.json();
                return json?.Data;
            },
            enabled: !!id,
        })),
    });

    const itemSummary = itemQueries.map((q) => q.data).filter(Boolean);
    const serviceTitle = itemSummary.map(item =>
        item?.propertyType?.serviceType?.title || null
    );

    // Price calculation with separate VAT for each item
    const itemSummaryWithTotal = itemSummary.map(item => {
        const price = Number(item.price || 0);
        const serviceCharge = Number(item.serviceCharge || 0);

        // const vat = Number(item.vat || 0);
        // const vatAmount = (price * vat) / 100;
        // const servicePriceWithVat = price + vatAmount;

        const subTotal = price + serviceCharge;
        const vat = subTotal * 0.05;
        const totalToPay = subTotal + vat;

        return {
            ...item,
            servicePrice: price,
            subTotal,
            vat,
            serviceCharge,
            totalToPay,
        };
    });



    // service price without vat
    const servicePrice = itemSummaryWithTotal.reduce(
        (acc, item) => acc + item.price,
        0
    );

    // subtotal calculations 
    const subTotal = itemSummaryWithTotal.reduce(
        (acc, item) => acc + item.subTotal,
        0
    );

    // vat calculation_ static
    const vat = itemSummaryWithTotal.reduce(
        (acc, item) => acc + item.vat,
        0
    );

    // serviceCharge calculation
    const serviceCharge = itemSummaryWithTotal.reduce(
        (acc, item) => acc + item.serviceCharge,
        0
    );

    const totalToPay = itemSummaryWithTotal.reduce(
        (acc, item) => acc + item.totalToPay,
        0
    );

    // Calculate total after discount
    const discountAmount =
        useDiscount > 0 ? (totalToPay * useDiscount) / 100 : 0;
    const totalAfterDiscount = totalToPay - discountAmount;


    const summaryInfo = {
        // service related functionality 
        servicePrice,
        subTotal,
        vat,
        serviceCharge,
        totalToPay,
        totalAfterDiscount,

        // promo related 
        useDiscount,
        setUseDiscount,
        promo,
        promoStatus,
        setPromo,
        setPromoStatus,
        handleApply,

        // item date 
        itemSummary: itemSummaryWithTotal,
        serviceTitle,

        // UI state
        services,
        button,
        setActiveId,
        activeId,
        content,
        showInput,
        setShowInput,
        date,
        setDate,
        time,
        setTime,

        // location deta
        mapLatitude,
        setMapLatitude,
        mapLongitude,
        setMapLongitude,
        addressLocation,
        setAddressLocation,
        liveAddress,
        setLiveAddress,

        // save address
        saveAddress,
        setSaveAddress
    };

    return (
        <SummaryContext.Provider value={summaryInfo}>
            {children}
        </SummaryContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSummary = () => useContext(SummaryContext);




// main component code
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import useAllServices from "../hooks/useAllServices";
// import useCoverContent from "../hooks/useCoverContent";
// import useButton from "../hooks/useButton";
// import { useItem } from "./ItemProvider";
// import { useQueries } from "@tanstack/react-query";

// const SummaryContext = createContext();

// export const SummaryProvider = ({ children }) => {
//     const observer = useRef(null);
//     const { data } = useItem();
//     const [services] = useAllServices();
//     const [content] = useCoverContent();
//     const [button] = useButton();
//     const [showInput, setShowInput] = useState(false);
//     const [activeId, setActiveId] = useState(null);
//     const [date, setDate] = useState("");
//     const [time, setTime] = useState("");
//     const [addressLocation, setAddressLocation] = useState(null);
//     const [mapLatitude, setMapLatitude] = useState("");
//     const [mapLongitude, setMapLongitude] = useState("");
//     const [liveAddress, setLiveAddress] = useState("");
//     const [useDiscount, setUseDiscount] = useState(0);

//     const [saveAddress, setSaveAddress] = useState(() => {
//         const stored = localStorage.getItem("saveAddress");
//         if (!stored) return [];

//         try {
//             const parsed = JSON.parse(stored);
//             return Array.isArray(parsed) ? parsed : [];
//             // eslint-disable-next-line no-unused-vars
//         } catch (err) {
//             console.error("Invalid saveAddress in localStorage:", stored);
//             localStorage.removeItem("saveAddress");
//             return [];
//         }
//     });


//     useEffect(() => {
//         localStorage.setItem("saveAddress", JSON.stringify(saveAddress));
//     }, [saveAddress]);


//     useEffect(() => {
//         const sections = document.querySelectorAll("[id^='content-']");
//         observer.current = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     if (entry.isIntersecting) {
//                         const visibleId = entry.target.getAttribute("id").replace("content-", "");
//                         setActiveId(visibleId);
//                     }
//                 });
//             },
//             { threshold: 0.5 }
//         );
//         sections.forEach((section) => observer.current.observe(section));
//         return () => {
//             if (observer.current) {
//                 sections.forEach((section) => observer.current.unobserve(section));
//             }
//         };
//     }, [content]);

//     const itemQueries = useQueries({
//         queries: data.map((id) => ({
//             queryKey: ["item-summary", id],
//             queryFn: async () => {
//                 const res = await fetch(
//                     `https://job-task-nu.vercel.app/api/v1/property-items/${id}`
//                 );
//                 const json = await res.json();
//                 return json?.Data;
//             },
//             enabled: !!id,
//         })),
//     });

//     const itemSummary = itemQueries.map((q) => q.data).filter(Boolean);
//     const serviceTitle = itemSummary.map(item =>
//         item?.propertyType?.serviceType?.title || null
//     );

//     const serviceCharge = itemSummary.reduce((acc, item) => acc + Number(item?.price || 0), 0);
//     const serviceFeeTotal = itemSummary.reduce((acc, item) => acc + Number(item?.serviceCharge || 0), 0);
//     const serviceFee = Number((serviceCharge > 0 ? serviceFeeTotal : 0).toFixed(2));
//     const subTotal = Number(serviceCharge + serviceFee);
//     const vat = Number((serviceCharge * 0.05).toFixed(2));
//     const total = Number((serviceCharge + serviceFee + vat).toFixed(2));

//     const summeryInfo = { serviceCharge, serviceFee, subTotal, vat, total, services, button, setActiveId, activeId, content, itemSummary, showInput, setShowInput, date, setDate, time, setTime, serviceTitle, mapLatitude, setMapLatitude, mapLongitude, setMapLongitude, addressLocation, setAddressLocation, liveAddress, setLiveAddress, saveAddress, setSaveAddress, setUseDiscount };

//     return (
//         <SummaryContext.Provider value={summeryInfo}>
//             {children}
//         </SummaryContext.Provider>
//     );
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useSummary = () => useContext(SummaryContext);