import React, { useRef, useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket } from '../../viewmodels/viewmodels';
import './popup.css'; // Ensure this imports the correct CSS file

interface EditTicketModalProps {
    open: boolean;
    onClose: () => void;
    ticket: Ticket;
    callback: (ticket: Ticket, setError: (error: string) => void) => void;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ open, callback, onClose, ticket }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [currentTicket, setCurrentTicket] = useState<Ticket>(ticket);
    const [error, setError] = useState('');
    
    useClickOutside(modalRef, onClose);

    if (!open) return null;

    const handleEdit = () => {
        if (!currentTicket.brand || !currentTicket.model || !currentTicket.registrationId || !currentTicket.description) {
            setError('Please fill all the fields');
            return;
        }
        callback(currentTicket, setError);
    };

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
                            Edit Ticket
                        </div>
                        <div className="modal-body">
                            <span className="mt-2 text-sm font-medium text-gray-700">Registration ID</span>
                            <input
                                className="w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                required
                                placeholder="Brand"
                                value={currentTicket.brand}
                                onChange={(e) => setCurrentTicket({ ...currentTicket, brand: e.target.value })}
                            />
                            <span className=" mt-2 text-sm font-medium text-gray-700">Model</span>
                            <input
                                className="w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                required
                                placeholder="Model"
                                value={currentTicket.model}
                                onChange={(e) => setCurrentTicket({ ...currentTicket, model: e.target.value })}
                            />
                            <span className="mt-2 text-sm font-medium text-gray-700">Registration ID</span>
                            <input
                                className="w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                required
                                placeholder="Registration ID"
                                value={currentTicket.registrationId}
                                onChange={(e) => setCurrentTicket({ ...currentTicket, registrationId: e.target.value })}
                            />
                            <span className="mt-2 text-sm font-medium text-gray-700">Status</span>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={currentTicket.status}
                                onChange={(e) => setCurrentTicket({ ...currentTicket, status: e.target.value })}>
                                <option value="created">Created</option>
                                <option value="In progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                            <span className="mt-2 text-sm font-medium text-gray-700">Description</span>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Description"
                                required
                                value={currentTicket.description}
                                onChange={(e) => setCurrentTicket({ ...currentTicket, description: e.target.value })}
                            />
                            {error && <p className="text-red-500 text-center pt-2">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-button confirm"
                                onClick={handleEdit}
                            >
                                Edit
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

export default EditTicketModal;
