import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../constants/consts';
import { Ticket } from '../../viewmodels/viewmodels';
import './home.css'; // Ensure this import is correct

const AvailableTicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchTickets() {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/ticket/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    },
                    credentials: 'include',
                });

                const data = await response.json();
                if (response.ok) {
                    setTickets(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTickets();
    }, []);

    return (
        <div className="container">
            <div className="header">
                <h1>All Available Tickets</h1>
            </div>
            <div className="table-wrapper">
                {isLoading ? (
                    <p className="text-lg text-gray-500">Loading...</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Brand</th>
                                <th>Model</th>
                                <th>Estimated Cost</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>{ticket.brand}</td>
                                    <td>{ticket.model}</td>
                                    <td>{ticket.totalPrice}</td>
                                    <td>{ticket.status}</td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/ticket/${ticket.id}`)}
                                            className="button custom-blue text-white font-bold py-2 px-4 rounded"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AvailableTicketsPage;
