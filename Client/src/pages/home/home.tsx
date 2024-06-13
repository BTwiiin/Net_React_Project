import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../main';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../constants/consts';
import CreateTicketModal from '../../components/popupwindows/createTicketPopUp';
import { Ticket, TicketModel } from '../../viewmodels/viewmodels';
import ConfirmModal from '../../components/popupwindows/confirmPopUp';
import DropdownMenu from '../../components/dropdownmenu';
import './home.css';

const Home = observer(() => {
  const workshop = useContext(Context);
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsOnPage, setTicketsOnPage] = useState<Ticket[]>([]);
  const ticketsPerPage = 5;

  useEffect(() => {
    const start = (currentPage - 1) * ticketsPerPage;
    const end = start + ticketsPerPage;
    setTicketsOnPage(tickets.slice(start, end));
  }, [currentPage, tickets]);

  const onCreate = async (ticket: TicketModel, setError: (error: string) => void) => {
    try {
      
      const response = await fetch(`${API_URL}/ticket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify(ticket),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsCreateModalOpen(false);
        await getUserTickets(); // Get updated user tickets
      } else {
        setError(data.Message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
    }
  };

  const getUserTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/ticket/user/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
  };

  const deleteTicket = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/ticket/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTickets(tickets.filter((ticket: Ticket) => ticket.id !== id));
      }
    } catch (error: any) {
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    getUserTickets();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Assigned Tickets</h1>
      </div>
      <div className="grid-container">
        {isLoading ? (
          <p className="text-lg text-gray-500">Loading...</p>
        ) : (
          ticketsOnPage.map((ticket: Ticket) => (
            <div key={ticket.id} className="grid-item">
              <div>
                <strong>Model:</strong> {ticket.model}
              </div>
              <div>
                <strong>Brand:</strong> {ticket.brand}
              </div>
              <div>
                <strong>Estimated Cost:</strong> {ticket.totalPrice}
              </div>
              <div>
                <strong>Status:</strong> {ticket.status}
              </div>
              <DropdownMenu
                options={[
                  {
                    name: 'View',
                    callback: () => navigate(`/ticket/${ticket.id}`)
                  },
                  {
                    name: 'Delete',
                    callback: () => {
                      setSelectedTicketId(ticket.id);
                      setIsConfirmModalOpen(true);
                    }
                  }
                ]}
              />
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center my-4">
        <button
          className="button blue"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Ticket
        </button>
        <button
          className="button blue"
          onClick={() => navigate("/available-tickets")}
        >
          Choose Ticket
        </button>
      </div>

      <CreateTicketModal
        open={isCreateModalOpen}
        onCreate={onCreate}
        onCancel={() => setIsCreateModalOpen(false)}
      />
      <ConfirmModal
        open={isConfirmModalOpen}
        message="Are you sure you want to delete this ticket?"
        onConfirm={async () => {
          await deleteTicket(selectedTicketId);
          setIsConfirmModalOpen(false);
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}
      />
    </div>
  );
});

export default Home;
