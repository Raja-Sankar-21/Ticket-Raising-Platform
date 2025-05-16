const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  status: { type: String, default: "open" },
  priority: { type: String, default: "Low" }
});

module.exports = mongoose.model('Ticket', ticketSchema);