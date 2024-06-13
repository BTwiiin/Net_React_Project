import React, { useRef, useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { TicketModel } from '../../viewmodels/viewmodels';
import './popup.css'; // Ensure this imports the correct CSS file

interface CreateTicketPopUp {
    open: boolean;
    onCreate: (ticket: TicketModel, setError: (error: string) => void) => void;
    onCancel: () => void;
}

const CreateTicketModal: React.FC<CreateTicketPopUp> = ({ open, onCreate, onCancel }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [ticket, setTicket] = useState<TicketModel>({ brand: '', model: '', registrationId: '', description: '' });
    const [error, setError] = useState('');
    
    useClickOutside(modalRef, onCancel);

    if (!open) return null;

    const handleCreate = () => {
        if (!ticket.brand || !ticket.model || !ticket.registrationId || !ticket.description) {
            setError('Please fill all the fields');
            return;
        }
        onCreate(ticket, setError);
        setTicket({ brand: '', model: '', registrationId: '', description: '' });
        setError('');
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
                            Create Ticket
                        </div>
                        <div className="modal-body">
                            <div className="mt-2">
                                <input
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    required
                                    placeholder="Brand"
                                    value={ticket.brand}
                                    onChange={(e) => setTicket({ ...ticket, brand: e.target.value })}
                                />
                                <input
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    required
                                    placeholder="Model"
                                    value={ticket.model}
                                    onChange={(e) => setTicket({ ...ticket, model: e.target.value })}
                                />
                                <input
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    required
                                    placeholder="Registration ID"
                                    value={ticket.registrationId}
                                    onChange={(e) => setTicket({ ...ticket, registrationId: e.target.value })}
                                />
                                <textarea
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description"
                                    required
                                    value={ticket.description}
                                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                                />
                            </div>
                            {error && <p className="text-red-500 text-center pt-2">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-button confirm"
                                onClick={handleCreate}
                            >
                                Create
                            </button>
                            <button
                                className="modal-button cancel"
                                onClick={onCancel}
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

export default CreateTicketModal;
