import { useState } from "react";
import dirhum from '../../assets/icon/dirhum.png';
import { MdOutlineArrowRightAlt } from "react-icons/md";
import ContentModal from "../ContentModal/ContentModal";

const CoverContent = ({ content }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const properties = Array.isArray(content?.propertyType)
        ? content.propertyType
        : [];

    const handleOpenModal = (property) => {
        setSelectedProperty(property);
        setShowModal(true);
    };

    return (
        <div className="mt-3 md:mt-6">
            {properties.map((property, idx) => (
                <div
                    key={idx}
                    onClick={() => handleOpenModal(property)}
                    className="group cursor-pointer transition-all duration-200 mb-4 md:mb-5 p-3 md:p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                >
                    <div className="md:flex md:items-start md:gap-4 lg:gap-5">
                        {/* Image - Professional Compact */}
                        <div className="relative mb-3 md:mb-0 md:flex-shrink-0">
                            <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                <img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-36 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Professional Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>

                        {/* Content - Professional Compact */}
                        <div className="flex-1">
                            {/* Title & Description - Professional Typography */}
                            <div className="mb-3">
                                <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1.5 line-clamp-1">
                                    {property.title}
                                </h2>
                                <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2">
                                    {property.description}
                                </p>
                            </div>

                            {/* Price & Button - Professional Layout */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                                {/* Price - Compact Professional */}
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-xs mb-1">Starting from</p>
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            className="h-3.5 w-3.5 md:h-4 md:w-4"
                                            src={dirhum}
                                            alt="AED"
                                        />
                                        <span className="font-bold text-base md:text-lg text-gray-900">
                                            {property.startFrom.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-xs ml-1">per service</span>
                                    </div>
                                </div>

                                {/* Button - Professional Compact */}
                                <div className="w-full md:w-auto mt-1 md:mt-0">
                                    <button className="w-full md:w-auto min-w-[120px] border border-[#01788E] px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-center gap-2 text-[#01788E] rounded-lg text-xs md:text-sm font-medium hover:bg-[#01788E] hover:text-white cursor-pointer transition-all duration-200 active:scale-[0.98]">
                                        <span>{property.propertyItems?.length || 0} Options</span>
                                        <MdOutlineArrowRightAlt className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Optional: Professional Meta Info */}
                            <div className="mt-3 pt-3 border-t border-gray-100 hidden md:flex items-center gap-4">
                                {property.features && property.features.length > 0 && (
                                    <>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <BsCheckCircle className="w-3 h-3 text-green-500" />
                                            {property.features[0]}
                                        </span>
                                        {property.features.length > 1 && (
                                            <span className="text-xs text-gray-500">+{property.features.length - 1} more</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* 🔹 Modal */}
            {showModal && (
                <ContentModal
                    setShowModal={setShowModal}
                    property={selectedProperty}
                />
            )}
        </div>
    );
};

export default CoverContent;