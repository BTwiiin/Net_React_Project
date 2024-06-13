import React, { useRef, useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from '../../constants/consts';
import { PartModel } from '../../viewmodels/viewmodels';
import './popup.css'; // Ensure this imports the correct CSS file

interface AddPartModalProps {
    open: boolean;
    onClose: () => void;
    ticketId: string;
    callback: () => void;
}

const AddPartModal: React.FC<AddPartModalProps> = ({ open, onClose, ticketId, callback }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [part, setPart] = useState<PartModel>({
        name: '',
        price: 1,
        quantity: 1,
    });
    const [error, setError] = useState('');

    useClickOutside(modalRef, onClose);

    const handleAddPart = async () => {
        if (!part.name || !part.price || !part.quantity) {
            setError('Please fill all the fields');
            return;
        }
        if (part.price < 0 || part.quantity < 0) {
            setError('Price and quantity cannot be negative');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/part/add/${ticketId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ ...part }),
            });

            if (response.ok) {
                await callback();
                setPart({ name: '', price: 1, quantity: 1 });
                onClose();
            } else {
                setError('Failed to add part');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while adding the part');
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <div ref={modalRef} className="modal-container">
                        <div className="modal-header">
                            Add Part
                        </div>
                        <div className="modal-body">
                            <label className="block font-medium text-gray-700">Part Name</label>
                            <input
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                required
                                placeholder="Part Name"
                                value={part.name}
                                onChange={(e) => setPart({ ...part, name: e.target.value })}
                            />
                            <label className="block font-medium text-gray-700 mt-2">Price</label>
                            <input
                                className="w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                required
                                placeholder="Cost"
                                value={part.price}
                                onChange={(e) => setPart({ ...part, price: Number(e.target.value) })}
                            />
                            <label className="block font-medium text-gray-700 mt-2">Quantity</label>
                            <input
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                required
                                placeholder="Quantity"
                                value={part.quantity}
                                onChange={(e) => setPart({ ...part, quantity: Number(e.target.value) })}
                            />
                            {error && <p className="text-red-500 text-center pt-2">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-button confirm"
                                onClick={handleAddPart}
                            >
                                Add
                            </button>
                            <button
                                className="modal-button cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddPartModal;
