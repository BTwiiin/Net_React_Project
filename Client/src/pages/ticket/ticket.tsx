import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../constants/consts';
import AddTimeSlotModal from '../../components/popupwindows/timeSlotPopUp';
import AddPartModal from '../../components/popupwindows/partPopUp';
import { Ticket, Part, TimeSlot } from '../../viewmodels/viewmodels';
import { observer } from 'mobx-react-lite';
import { Context } from '../../main';
import DropdownMenu from '../../components/dropdownmenu';
import EditTicketModal from '../../components/popupwindows/editTicketPopUp';
import Header from '../../components/header';
import './ticket.css';

const TicketPage: React.FC = observer(() => {
    const { id } = useParams<{ id: string }>();
    const workshop = useContext(Context);

    const [ticket, setTicket] = useState<Ticket>({
        id: 0,
        brand: '',
        model: '',
        registrationId: '',
        description: '',
        totalPrice: 0,
        status: '',
        timeSlots: [],
    });
    const [parts, setParts] = useState<Part[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isAddTimeSlotModalOpen, setIsAddTimeSlotModalOpen] = useState(false);
    const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);

    const editTicket = async (ticket: Ticket, setError: (error: string) => void) => {
        try {
            workshop.isLoading = true;
            const response = await fetch(`${API_URL}/ticket/update/${ticket.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                credentials: 'include',
                body: JSON.stringify({ ...ticket, timeSlots: [], parts: [] }),
            });

            if (response.ok) {
                setTicket(ticket);
                setError('');
                setIsEditTicketModalOpen(false);
            } else {
                setError('Failed to update ticket');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while updating the ticket');
        } finally {
            workshop.isLoading = false;
        }
    };

    const onDelete = async (part: Part) => {
        try {
            const response = await fetch(`${API_URL}/part/delete/${part.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                setTicket({ ...ticket, totalPrice: ticket.totalPrice - part.totalPrice });
                setParts(parts.filter((p) => p.id !== part.id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    async function deleteTimeSlot(id: number) {
        try {
            const response = await fetch(`${API_URL}/timeslot/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchTicketDetails() {
        try {
            workshop.isLoading = true;
            const response = await fetch(`${API_URL}/ticket/specific/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setTicket(data);
                setParts(data.parts);
                setTimeSlots(data.timeSlots);
            }
        } catch (error) {
            console.error(error);
        } finally {
            workshop.isLoading = false;
        }
    }

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    return (
        <div className="screen-1">
            <Header /> {/* Ensure the Header component is included */}
            <div className="container">
                <h1 className="header">Ticket Details</h1>
                {ticket && (
                    <div className="ticket-details">
                        <div className="info-section">
                            <h2>Info</h2>
                            <div className="info-item">
                                <p><strong>Brand:</strong> {ticket.brand}</p>
                                <p><strong>Model:</strong> {ticket.model}</p>
                            </div>
                            <div className="info-item">
                                <p><strong>Registration ID:</strong> {ticket.registrationId}</p>
                                <p><strong>Total Price:</strong> {ticket.totalPrice}</p>
                            </div>
                            <div className="info-item">
                                <p><strong>Status:</strong> {ticket.status}</p>
                            </div>
                            <div className="info-item">
                                <p><strong>Description:</strong> {ticket.description}</p>
                            </div>
                            <div className="button-group">
                                <button
                                    className="button blue"
                                    onClick={() => setIsAddTimeSlotModalOpen(true)}
                                >
                                    Add Time Slots
                                </button>
                                <button
                                    className="button blue"
                                    onClick={() => setIsPartModalOpen(true)}
                                >
                                    Add Part
                                </button>
                                <button
                                    className="button blue"
                                    onClick={() => setIsEditTicketModalOpen(true)}
                                >
                                    Edit Ticket
                                </button>
                            </div>
                        </div>
                        <div className="parts-section">
                            <h3>Parts</h3>
                            {parts.length === 0 && <p>No parts added</p>}
                            {parts.length > 0 && (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Cost</th>
                                            <th>Quantity</th>
                                            <th>Total Cost</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parts.map((part) => (
                                            <tr key={part.id}>
                                                <td>{part.name}</td>
                                                <td>{part.price}</td>
                                                <td>{part.quantity}</td>
                                                <td>{part.totalPrice}</td>
                                                <td>
                                                    <DropdownMenu options={[
                                                        {
                                                            name: "Delete",
                                                            callback: () => onDelete(part)
                                                        }
                                                    ]} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="timeslots-section">
                            <h3>Time Slots</h3>
                            {timeSlots.length === 0 && <p>No time slots added</p>}
                            {timeSlots.length > 0 && (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((slot) => (
                                            <tr key={slot.id}>
                                                <td>{new Date(slot.startTime).toLocaleString()}</td>
                                                <td>{new Date(slot.endTime).toLocaleString()}</td>
                                                <td>
                                                    <DropdownMenu options={[
                                                        {
                                                            name: "Delete",
                                                            callback: () => deleteTimeSlot(slot.id)
                                                        }
                                                    ]} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
                {isAddTimeSlotModalOpen && (
                    <AddTimeSlotModal
                        open={isAddTimeSlotModalOpen}
                        onClose={() => setIsAddTimeSlotModalOpen(false)}
                        callback={fetchTicketDetails}
                        ticketId={id!}
                    />
                )}
                {isPartModalOpen && (
                    <AddPartModal
                        open={isPartModalOpen}
                        onClose={() => setIsPartModalOpen(false)}
                        ticketId={id!}
                        callback={fetchTicketDetails}
                    />
                )}
                {isEditTicketModalOpen && (
                    <EditTicketModal
                        open={isEditTicketModalOpen}
                        onClose={() => setIsEditTicketModalOpen(false)}
                        ticket={ticket}
                        callback={editTicket}
                    />
                )}
            </div>
        </div>
    );
});

export default TicketPage;
