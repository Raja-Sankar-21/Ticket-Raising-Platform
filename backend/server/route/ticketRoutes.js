const express = require('express');
const router = express.Router();
const Ticket = require('../module/ticket');

router.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    console.log("Fetched Tickets:", tickets);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/tickets/:id', getTicket, (req, res) => {
    res.json(res.ticket);
});

router.post('/tickets', async (req, res) => {
  console.log("Request Body:", req.body)

  const ticket = new Ticket({
    title: req.body.title,
    description: req.body.description,
    createdBy: req.body.createdBy,
    status: req.body.status || "open",
    priority: req.body.priority || "Low"
  });

  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error saving ticket:", error);
    res.status(400).json({ message: error.message });
  }
});

router.patch('/tickets/:id', async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.priority) updateFields.priority = req.body.priority;
    if (req.body.status) updateFields.status = req.body.status;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getTicket(req, res, next) {
    let ticket;
    try {
        ticket = await Ticket.findById(req.params.id);
        if (ticket == null) {
            return res.status(404).json({ message: 'Cannot find ticket' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.ticket = ticket;
    next();
}

module.exports = router;