// import { useNavigate } from "react-router-dom";
import { useState } from "react";


const CassieModal = ({ open, onClose }) => {
    // const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    if (!open) return null;

    const handleSubmit = () => {
        if (!form.firstName || !form.lastName || !form.email) {
            alert("All fields required");
            return;
        }

        onClose();
        // navigate("/confirmation");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex md:items-center md:justify-center">

            {/* overlay click close */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* MODAL BOX */}
            <div
                className="
          relative bg-white w-full
          md:max-w-lg md:rounded-xl

          /* mobile bottom sheet */
          fixed bottom-0 h-[50vh] rounded-t-2xl

          /* md+ normal modal */
          md:static md:h-auto md:rounded-xl
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b md:border-none">
                    <h2 className="text-lg font-semibold text-center">
                        Continue as Guest
                    </h2>
                </div>

                {/* Body (scrollable) */}
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(50vh-120px)] md:h-auto">
                    <input
                        type="text"
                        placeholder="First Name"
                        className="w-full border rounded px-3 py-2"
                        value={form.firstName}
                        onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full border rounded px-3 py-2"
                        value={form.lastName}
                        onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                        }
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border rounded px-3 py-2"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>

                {/* FOOTER – sticky for mobile */}
                <div className="sticky bottom-0 bg-white p-4 border-t">
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#ED6329] text-white py-3 rounded font-semibold"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CassieModal;