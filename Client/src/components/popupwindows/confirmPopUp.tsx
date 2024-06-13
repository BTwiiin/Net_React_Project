import React, { useRef } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import './popup.css';

interface ConfirmPopUp {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmPopUp> = ({ open, message, onConfirm, onCancel }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useClickOutside(modalRef, onCancel);

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
                            Confirm Action
                        </div>
                        <div className="modal-body">
                            <p>{message}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="modal-button confirm"
                            >
                                Confirm
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="modal-button cancel"
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

export default ConfirmModal;
