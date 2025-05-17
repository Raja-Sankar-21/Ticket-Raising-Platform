import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    createdBy: "",
    status: "open",
    priority: "Low",
    search: ""
  });
  const [filter, setFilter] = useState({
    status: "All",
    priority: "All"
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tickets`);
      console.log("Response:", response);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      console.log("Fetched Data:", data);
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      console.log("Response:", response);

      if (!response.ok) throw new Error("Failed to create ticket");

      const newTicket = await response.json();
      console.log("New Ticket:", newTicket);

      setTickets((prevTickets) => [...prevTickets, newTicket]);
      setFormData({
        title: "",
        description: "",
        createdBy: "",
        status: "open",
        priority: "Low",
        search: ""
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      setError("Failed to create ticket. Please try again later.");
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (query) => {
    const searchQuery = query.toLowerCase().trim();
    if (searchQuery !== "") {
      const searchedTickets = tickets.filter((ticket) =>
        ticket.title.toLowerCase().includes(searchQuery) ||
        ticket.description.toLowerCase().includes(searchQuery) ||
        ticket.createdBy.toLowerCase().includes(searchQuery)
      );
      setTickets(searchedTickets);
    } else {
      fetchTickets();
    }
  };

  const handleDelete = async (ticketId) => {
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "DELETE"
      });
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setError("Failed to delete ticket. Please try again later.");
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      });

      console.log("Response:", response);

      if (!response.ok) throw new Error("Failed to update priority");

      const updatedTicket = await response.json();
      console.log("Updated Ticket:", updatedTicket);

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, priority: updatedTicket.priority } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket priority:", error);
      setError("Failed to update priority. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Failed to update status");
      const updatedTicket = await response.json();
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status: updatedTicket.status } : ticket
        )
      );
    } catch (error) {
      setError("Failed to update status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusFilter = filter.status === "All" ? true : ticket.status === filter.status;
    const priorityFilter = filter.priority === "All" ? true : ticket.priority === filter.priority;
    return statusFilter && priorityFilter;
  });

  function getPriorityColor(priority) {
    switch (priority) {
      case "Low":
        return "#3ea359";
      case "Medium":
        return "#c4b225";
      case "High":
        return "#8a2f2f";
      default:
        return "white";
    }
  }

  return (
    <div className="App">
      <h1>Ticket Management System</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>Description:
          <input type="text" name="description" value={formData.description} onChange={handleChange} required />
        </label>
        <label>Created By:
          <input type="text" name="createdBy" value={formData.createdBy} onChange={handleChange} required />
        </label>
        <label>Priority:
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>

      <h2>Filters and Search</h2>
      <label>Status:
        <select name="status" value={filter.status} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="open">Open</option>
          <option value="in progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
      </label>
      <label>Priority:
        <select name="priority" value={filter.priority} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label>Search:
        <input
          type="text"
          name="search"
          value={formData.search}
          onChange={(e) => {
            setFormData({...formData, search: e.target.value });
            handleSearch(e.target.value);
          }}
        />
      </label>

      <h2>Tickets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card-container">
          {filteredTickets.map((ticket) => (
            <div key={ticket._id} className="card" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
              <div className="card-content">
                <strong>{ticket.title}</strong><br/>
                {ticket.description}<br/>
                (Created by: {ticket.createdBy})<br/>
                <span>Status: {ticket.status}</span>
              </div><br/>
              <div className="card-actions">
                <span>Priority: {ticket.priority}</span><br/>
                <label>
                  Update Priority:<br/><br/>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(ticket._id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
                <label>
                  Update Status:<br/><br/>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="open">Open</option>
                    <option value="in progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <button className="delete-button" onClick={() => handleDelete(ticket._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;