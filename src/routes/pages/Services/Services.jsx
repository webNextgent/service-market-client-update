/* eslint-disable react-hooks/exhaustive-deps */
// update active route
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import Summery from "../../../components/Summery/Summery";
import Cover from "../../../components/Cover/Cover";
import CoverContent from "../../../components/CoverContent/CoverContent";
import Card from "../../../components/Card/Card";
import NextBtn from "../../../components/NextBtn/NextBtn";
import useDashboardPropertyItem from "../../../hooks/useDashboardPropertyItem";
import dirhum from '../../../assets/icon/dirhum.png';
import { useEffect, useRef, useState, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoAddSharp } from "react-icons/io5";
import { useItem } from "../../../provider/ItemProvider";
import { useSummary } from "../../../provider/SummaryProvider";
import useAllServices from "../../../hooks/useAllServices";

const Services = () => {
    const { button, setActiveId, activeId, content, itemSummary, totalAfterDiscount, showInput, setShowInput, serviceTitle, totalVatRate } = useSummary();
    const [services] = useAllServices();
    const { addItem, removeItem } = useItem();
    const sectionRefs = useRef({});
    const buttonSliderRefs = useRef({});
    const [propertyItem] = useDashboardPropertyItem();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [open, setOpen] = useState(false);

    // Scroll active button into view
    useEffect(() => {
        if (activeId && buttonSliderRefs.current[activeId]) {
            const buttonElement = buttonSliderRefs.current[activeId];
            const sliderContainer = buttonElement?.closest('.overflow-x-auto');

            if (sliderContainer && buttonElement) {
                const containerRect = sliderContainer.getBoundingClientRect();
                const buttonRect = buttonElement.getBoundingClientRect();

                // Scroll if button is not fully visible
                if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
                    buttonElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        }
    }, [activeId]);

    // Intersection Observer for detecting visible sections
    useEffect(() => {
        const observers = [];

        content?.forEach((c) => {
            const element = sectionRefs.current[c.id];
            if (!element) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Update activeId when section is visible
                            setActiveId(c.id);
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: '-20% 0px -70% 0px',
                    threshold: 0.1
                }
            );

            observer.observe(element);
            observers.push({ observer, element });
        });

        return () => {
            observers.forEach(({ observer, element }) => {
                if (element) observer.unobserve(element);
                observer.disconnect();
            });
        };
    }, [content]);

    const handleAdd = (id) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: 1,
        }));
        addItem(id);
    };

    const handleRemove = (id) => {
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
        removeItem(id);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim() === "") {
            setSuggestions([]);
            setShowBackdrop(false);
            return;
        }
        const filtered = propertyItem.filter((item) =>
            item?.title?.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setShowBackdrop(filtered.length > 0);
    };

    const closeSuggestions = () => {
        setSuggestions([]);
        setShowBackdrop(false);
        setQuery("");
    };

    // Function to scroll to section (when button is clicked)
    const scrollToSection = useCallback((contentId) => {
        if (sectionRefs.current[contentId]) {
            const section = sectionRefs.current[contentId];
            const yOffset = -120;
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, []);

    return (
        <div>
            <div className="mt-10 md:mt-0">
                <ServiceDetails title="Service Details" currentStep={1} />
            </div>

            <div className="md:flex justify-center gap-8 mt-5">
                {/* Left */}
                <div className="md:w-[60%] md:mb-4 md:space-y-4">

                    {/* SEARCH INPUT + SUGGESTIONS */}
                    <div className="relative p-4 md:p-0">
                        <input
                            className="py-2 md:py-3 px-3 border border-[#01788E] w-full rounded-md md:px-7 focus:outline-none"
                            type="text"
                            placeholder="Search services..."
                            value={query}
                            onChange={handleChange}
                        />

                        {/* BACKDROP */}
                        {showBackdrop && (
                            <div
                                className="fixed inset-0 bg-black/20 z-40"
                                onClick={closeSuggestions}
                            ></div>
                        )}

                        {/* SUGGESTION BOX */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-md rounded-md mt-1 z-40 max-h-[90vh] overflow-y-auto p-8">
                                {suggestions.length > 0 ? (
                                    suggestions.map((item) => {
                                        const qty = quantities[item.id] || 0;
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 border-b pb-2.5 border-gray-300 space-y-2 mb-4"
                                            >
                                                {/* Image */}
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-28 h-26 mx-auto object-cover rounded-sm"
                                                />

                                                {/* Content */}
                                                <div className="space-y-2 flex-1">
                                                    <div>
                                                        <h3 className="text-[16px] font-semibold">{item.title}</h3>
                                                        <p className="text-gray-600 text-[13px]">{item.description}</p>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[#382F31] font-bold text-[14px] flex items-center gap-1">
                                                            <img className="h-[15px] w-[15px]" src={dirhum} alt="" /> {item.price}
                                                        </p>

                                                        {/* Add / Quantity Controller */}
                                                        {qty === 0 ? (
                                                            <button
                                                                onClick={() => handleAdd(item.id)}
                                                                className="cursor-pointer border px-2 py-1 flex items-center gap-2 text-[#01788E] rounded-xs hover:bg-gray-100 transition text-[13px]"
                                                            >
                                                                Add <IoAddSharp />
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleRemove(item.id)}
                                                                    className="text-[#01788E] border rounded-full font-bold text-lg px-[7px] cursor-pointer"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="font-semibold text-gray-700">
                                                                    {qty}
                                                                </span>

                                                                <button
                                                                    disabled
                                                                    className="text-gray-400 font-bold text-lg px-2 cursor-not-allowed border rounded-full border-[#014855]"
                                                                    title="Maximum quantity reached"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500">No options available.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SERVICE LIST + BUTTONS + CONTENT */}
                    <div className="shadow-md rounded-xl">
                        <div>
                            {services?.map((service) => (
                                <div key={service.id}>
                                    <Card service={service} />

                                    {/* BUTTON SLIDER */}
                                    <div className="px-2 md:px-9 bg-white py-3 sticky top-16 z-1">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const scroller = document.getElementById(`btn-slider-${service.id}`);
                                                    scroller?.scrollBy({ left: -300, behavior: "smooth" });
                                                }}
                                                className="text-3xl font-bold text-[#01788E]"
                                            >
                                                <IoIosArrowBack />
                                            </button>

                                            <div
                                                id={`btn-slider-${service.id}`}
                                                className="flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 py-2 w-full"
                                                style={{
                                                    scrollbarWidth: 'none', // Firefox
                                                    msOverflowStyle: 'none', // IE/Edge
                                                }}
                                            >
                                                {button
                                                    ?.filter((b) => b.serviceId === service.id)
                                                    .map((b) => (
                                                        <button
                                                            key={b.id}
                                                            ref={(el) => (buttonSliderRefs.current[b.id] = el)}
                                                            onClick={() => {
                                                                setActiveId(b.id);
                                                                scrollToSection(b.id);
                                                            }}
                                                            className={`snap-start shrink-0 min-w-[140px] px-4 py-1 rounded-full border flex items-center gap-2 transition
                                                                ${activeId === b.id
                                                                    ? "text-[#ED6329] border-[#ED6329] border-2 bg-[#FFF2EE]"
                                                                    : "text-[#01788E] border-[#01788E] bg-white"}`}
                                                        >
                                                            <img className="w-7 h-7 rounded-full" src={b.image} alt={b.title} />
                                                            {b.title}
                                                        </button>
                                                    ))}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const scroller = document.getElementById(`btn-slider-${service.id}`);
                                                    scroller?.scrollBy({ left: 300, behavior: "smooth" });
                                                }}
                                                className="text-3xl font-bold text-[#01788E]"
                                            >
                                                <IoIosArrowForward />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hide scrollbar with custom CSS */}
                                    <style jsx>{`
                                        .no-scrollbar::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>

                                    {/* CONTENT */}
                                    <div className="px-3 md:px-9 mt-3 space-y-6">
                                        {content
                                            ?.filter((c) => c.serviceId === service.id)
                                            .map((c) => (
                                                <div
                                                    key={c.id}
                                                    ref={(el) => (sectionRefs.current[c.id] = el)}
                                                    className="scroll-mt-24"
                                                >
                                                    <Cover content={c} />
                                                    <CoverContent content={c} />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2 px-3 pb-4 md:px-9 md:pb-6">
                            <h3 className="font-medium">Do you have any special instructions? (Optional)</h3>
                            <textarea
                                className="textarea text-sm bg-white w-full focus:outline-none border border-black"
                                placeholder="Example: Please mention any sensitivities, allergies or any particular requirements you may have."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <Summery
                    isValid={itemSummary.length !== 0}
                    totalVatRate={totalVatRate}
                    serviceTitle={serviceTitle}
                    itemSummary={itemSummary}
                    showInput={showInput}
                    setShowInput={setShowInput}
                    open={open}
                    setOpen={setOpen} />
            </div>

            {/* for mobile & tablet view  */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-gray-200 z-40">
                <div className="flex justify-center px-3 py-2">
                    <div className="flex items-center gap-4">

                        {/* View Summary */}
                        <button
                            onClick={() => setOpen(true)}
                            className="cursor-pointer select-none
                   active:scale-[0.98] transition-transform
                   focus:outline-none focus:ring-2
                   focus:ring-blue-500 focus:ring-offset-2
                   rounded-lg px-1"
                        >
                            <p className="text-[10px] text-gray-500 font-medium uppercase">
                                View Summary
                            </p>
                            <div className="flex items-center gap-1.5 justify-center">
                                <img src={dirhum} className="w-3.5 h-3.5" alt="" />
                                <span className="text-base font-bold text-gray-900">
                                    {totalAfterDiscount.toFixed(2)}
                                </span>
                                <span className="text-gray-400 text-sm">›</span>
                            </div>
                        </button>

                        {/* Next Button (Fixed Width) */}
                        <div className="w-[140px]">
                            <NextBtn
                                disabled={itemSummary.length === 0}
                            />
                        </div>

                    </div>
                </div>
            </div>

            <div className="hidden lg:block">
                <NextBtn disabled={itemSummary.length === 0} />
            </div>
        </div>
    );
};

export default Services;



// main code
// import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
// import Summery from "../../../components/Summery/Summery";
// import Cover from "../../../components/Cover/Cover";
// import CoverContent from "../../../components/CoverContent/CoverContent";
// import Card from "../../../components/Card/Card";
// import NextBtn from "../../../components/NextBtn/NextBtn";
// import useDashboardPropertyItem from "../../../hooks/useDashboardPropertyItem";
// import dirhum from '../../../assets/icon/dirhum.png';
// import { useEffect, useRef, useState } from "react";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import { IoAddSharp } from "react-icons/io5";
// import { useItem } from "../../../provider/ItemProvider";
// import { useSummary } from "../../../provider/SummaryProvider";


// const Services = () => {
//     const { services, button, setActiveId, activeId, content, itemSummary, totalAfterDiscount, showInput, setShowInput, serviceTitle, totalVatRate } = useSummary();

//     const { addItem, removeItem } = useItem();
//     const sectionRefs = useRef({});
//     const [propertyItem] = useDashboardPropertyItem();
//     const [query, setQuery] = useState("");
//     const [suggestions, setSuggestions] = useState([]);
//     const [quantities, setQuantities] = useState({});
//     const [showBackdrop, setShowBackdrop] = useState(false);
//     const [open, setOpen] = useState(false);

//     const handleAdd = (id) => {
//         setQuantities((prev) => ({
//             ...prev,
//             [id]: 1,
//         }));
//         addItem(id);
//     };

//     const handleRemove = (id) => {
//         setQuantities((prev) => {
//             const updated = { ...prev };
//             delete updated[id];
//             return updated;
//         });
//         removeItem(id);
//     };

//     const handleChange = (e) => {
//         const value = e.target.value;
//         setQuery(value);

//         if (value.trim() === "") {
//             setSuggestions([]);
//             setShowBackdrop(false);
//             return;
//         }
//         const filtered = propertyItem.filter((item) =>
//             item?.title?.toLowerCase().includes(value.toLowerCase())
//         );
//         setSuggestions(filtered);
//         setShowBackdrop(filtered.length > 0);
//     };

//     const closeSuggestions = () => {
//         setSuggestions([]);
//         setShowBackdrop(false);
//         setQuery("");
//     };

//     useEffect(() => {
//         if (activeId && sectionRefs.current[activeId]) {
//             const section = sectionRefs.current[activeId];
//             const yOffset = -120;
//             const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
//             window.scrollTo({ top: y, behavior: "smooth" });
//         }
//     }, [activeId]);

//     return (
//         <div>
//             <div className="mt-10 md:mt-0">
//                 <ServiceDetails title="Service Details" currentStep={1} />
//             </div>

//             <div className="md:flex justify-center gap-8 mt-5">
//                 {/* Left */}
//                 <div className="md:w-[60%] md:mb-4 md:space-y-4">

//                     {/* SEARCH INPUT + SUGGESTIONS */}
//                     <div className="relative p-4 md:p-0">
//                         <input
//                             className="py-2 md:py-3 px-3 border border-[#01788E] w-full rounded-md md:px-7 focus:outline-none"
//                             type="text"
//                             placeholder="Search services..."
//                             value={query}
//                             onChange={handleChange}
//                         />

//                         {/* BACKDROP */}
//                         {showBackdrop && (
//                             <div
//                                 className="fixed inset-0 bg-black/20 z-40"
//                                 onClick={closeSuggestions}
//                             ></div>
//                         )}

//                         {/* SUGGESTION BOX */}
//                         {suggestions.length > 0 && (
//                             <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-md rounded-md mt-1 z-40 max-h-[90vh] overflow-y-auto p-8">
//                                 {suggestions.length > 0 ? (
//                                     suggestions.map((item) => {
//                                         const qty = quantities[item.id] || 0;
//                                         return (
//                                             <div
//                                                 key={item.id}
//                                                 className="flex gap-4 border-b pb-2.5 border-gray-300 space-y-2 mb-4"
//                                             >
//                                                 {/* Image */}
//                                                 <img
//                                                     src={item.image}
//                                                     alt={item.title}
//                                                     className="w-28 h-26 mx-auto object-cover rounded-sm"
//                                                 />

//                                                 {/* Content */}
//                                                 <div className="space-y-2 flex-1">
//                                                     <div>
//                                                         <h3 className="text-[16px] font-semibold">{item.title}</h3>
//                                                         <p className="text-gray-600 text-[13px]">{item.description}</p>
//                                                     </div>

//                                                     <div className="flex justify-between items-center">
//                                                         <p className="text-[#382F31] font-bold text-[14px] flex items-center gap-1">
//                                                             <img className="h-[15px] w-[15px]" src={dirhum} alt="" /> {item.price}
//                                                         </p>

//                                                         {/* Add / Quantity Controller */}
//                                                         {qty === 0 ? (
//                                                             <button
//                                                                 onClick={() => handleAdd(item.id)}
//                                                                 className="cursor-pointer border px-2 py-1 flex items-center gap-2 text-[#01788E] rounded-xs hover:bg-gray-100 transition text-[13px]"
//                                                             >
//                                                                 Add <IoAddSharp />
//                                                             </button>
//                                                         ) : (
//                                                             <div className="flex items-center gap-3">
//                                                                 <button
//                                                                     onClick={() => handleRemove(item.id)}
//                                                                     className="text-[#01788E] border rounded-full font-bold text-lg px-[7px] cursor-pointer"
//                                                                 >
//                                                                     −
//                                                                 </button>
//                                                                 <span className="font-semibold text-gray-700">
//                                                                     {qty}
//                                                                 </span>

//                                                                 <button
//                                                                     disabled
//                                                                     className="text-gray-400 font-bold text-lg px-2 cursor-not-allowed border rounded-full border-[#014855]"
//                                                                     title="Maximum quantity reached"
//                                                                 >
//                                                                     +
//                                                                 </button>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })
//                                 ) : (
//                                     <p className="text-center text-gray-500">No options available.</p>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* SERVICE LIST + BUTTONS + CONTENT */}
//                     <div className="shadow-md rounded-xl">
//                         <div>
//                             {services?.map((service) => (
//                                 <div key={service.id}>
//                                     <Card service={service} />

//                                     {/* BUTTON SLIDER */}
//                                     <div className="px-2 md:px-9 bg-white py-3 sticky top-16 z-1">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <button
//                                                 onClick={() => {
//                                                     const scroller = document.getElementById(`btn-slider-${service.id}`);
//                                                     scroller?.scrollBy({ left: -300, behavior: "smooth" });
//                                                 }}
//                                                 className="text-3xl font-bold text-[#01788E]"
//                                             >
//                                                 <IoIosArrowBack />
//                                             </button>

//                                             <div
//                                                 id={`btn-slider-${service.id}`}
//                                                 className="flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 py-2 w-full"
//                                             >
//                                                 {button
//                                                     ?.filter((b) => b.serviceId === service.id)
//                                                     .map((b) => (
//                                                         <button
//                                                             key={b.id}
//                                                             onClick={() => setActiveId(b.id)}
//                                                             className={`snap-start shrink-0 min-w-[140px] px-4 py-1 rounded-full border flex items-center gap-2 transition
//                                                                 ${activeId === b.id
//                                                                     ? "text-[#ED6329] border-[#ED6329] border-2 bg-[#FFF2EE]"
//                                                                     : "text-[#01788E] border-[#01788E] bg-white"}`}
//                                                         >
//                                                             <img className="w-7 h-7 rounded-full" src={b.image} alt={b.title} />
//                                                             {b.title}
//                                                         </button>
//                                                     ))}
//                                             </div>

//                                             <button
//                                                 onClick={() => {
//                                                     const scroller = document.getElementById(`btn-slider-${service.id}`);
//                                                     scroller?.scrollBy({ left: 300, behavior: "smooth" });
//                                                 }}
//                                                 className="text-3xl font-bold text-[#01788E]"
//                                             >
//                                                 <IoIosArrowForward />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* CONTENT */}
//                                     <div className="px-3 md:px-9 mt-3 space-y-6">
//                                         {content
//                                             ?.filter((c) => c.serviceId === service.id)
//                                             .map((c) => (
//                                                 <div
//                                                     key={c.id}
//                                                     ref={(el) => (sectionRefs.current[c.id] = el)}
//                                                     className="scroll-mt-24"
//                                                 >
//                                                     <Cover content={c} />
//                                                     <CoverContent content={c} />
//                                                 </div>
//                                             ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Instructions */}
//                         <div className="space-y-2 px-3 pb-4 md:px-9 md:pb-6">
//                             <h3 className="font-medium">Do you have any special instructions? (Optional)</h3>
//                             <textarea
//                                 className="textarea text-sm bg-white w-full focus:outline-none border border-black"
//                                 placeholder="Example: Please mention any sensitivities, allergies or any particular requirements you may have."
//                             ></textarea>
//                         </div>
//                     </div>
//                 </div>

//                 <Summery
//                     isValid={itemSummary.length !== 0}
//                     totalVatRate={totalVatRate}
//                     serviceTitle={serviceTitle}
//                     itemSummary={itemSummary}
//                     showInput={showInput}
//                     setShowInput={setShowInput}
//                     open={open}
//                     setOpen={setOpen} />
//             </div>

//             {/* for mobile & tablet view  */}
//             <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-gray-200 z-40">
//                 <div className="flex justify-center px-3 py-2">
//                     <div className="flex items-center gap-4">

//                         {/* View Summary */}
//                         <button
//                             onClick={() => setOpen(true)}
//                             className="cursor-pointer select-none
//                    active:scale-[0.98] transition-transform
//                    focus:outline-none focus:ring-2
//                    focus:ring-blue-500 focus:ring-offset-2
//                    rounded-lg px-1"
//                         >
//                             <p className="text-[10px] text-gray-500 font-medium uppercase">
//                                 View Summary
//                             </p>
//                             <div className="flex items-center gap-1.5 justify-center">
//                                 <img src={dirhum} className="w-3.5 h-3.5" alt="" />
//                                 <span className="text-base font-bold text-gray-900">
//                                     {totalAfterDiscount.toFixed(2)}
//                                 </span>
//                                 <span className="text-gray-400 text-sm">›</span>
//                             </div>
//                         </button>

//                         {/* Next Button (Fixed Width) */}
//                         <div className="w-[140px]">
//                             <NextBtn
//                                 disabled={itemSummary.length === 0}
//                             />
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             <div className="hidden lg:block">
//                 <NextBtn disabled={itemSummary.length === 0} />
//             </div>
//         </div>
//     );
// };

// export default Services;