import React, { useRef, useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from '../../constants/consts';
import './popup.css'; // Ensure this imports the correct CSS file

interface AddTimeSlotModalProps {
    open: boolean;
    onClose: () => void;
    ticketId: string;
    callback: () => void;
}

const AddTimeSlotModal: React.FC<AddTimeSlotModalProps> = ({ open, onClose, ticketId, callback }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [timeSlot, setTimeSlot] = useState({ startDate: '', startHour: '', endHour: '' });
    const [error, setError] = useState('');

    useClickOutside(modalRef, onClose);

    const handleAddTimeSlot = async () => {
        if (!timeSlot.startDate || !timeSlot.startHour || !timeSlot.endHour) {
            setError('Please fill all the fields');
            return;
        }

        const startTime = new Date(timeSlot.startDate);
        startTime.setHours(parseInt(timeSlot.startHour), 0, 0, 0);
        const endTime = new Date(timeSlot.startDate);
        endTime.setHours(parseInt(timeSlot.endHour), 0, 0, 0);
        const now = new Date();

        if (startTime <= now || startTime >= endTime) {
            setError('Invalid times: times must be in the future and end time must be after start time');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/timeslot/add/${ticketId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ StartTime: startTime.toISOString(), EndTime: endTime.toISOString(), ticketId }),
            });

            if (response.ok) {
                callback();
                setError('');
                setTimeSlot({ startDate: '', startHour: '', endHour: '' });
                onClose();
            } else {
                const data = await response.json();
                setError(data.Message || 'An error occurred');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred');
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
                            Add Time Slot
                        </div>
                        <div className="modal-body">
                            <input
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="date"
                                required
                                placeholder="Date"
                                value={timeSlot.startDate}
                                onChange={(e) => setTimeSlot({ ...timeSlot, startDate: e.target.value })}
                            />
                            <input
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                min="0"
                                max="23"
                                required
                                placeholder="Start Hour"
                                value={timeSlot.startHour}
                                onChange={(e) => setTimeSlot({ ...timeSlot, startHour: e.target.value })}
                            />
                            <input
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                min="0"
                                max="23"
                                required
                                placeholder="End Hour"
                                value={timeSlot.endHour}
                                onChange={(e) => setTimeSlot({ ...timeSlot, endHour: e.target.value })}
                            />
                            {error && <p className="text-red-500 text-center pt-2">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-button confirm"
                                onClick={handleAddTimeSlot}
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

export default AddTimeSlotModal;
