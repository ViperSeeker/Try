// api.js - Main API routes
const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Get example data
router.get('/data', (req, res) => {
  // Sample data - replace with actual data from database when implemented
  const data = [
    { id: 1, name: 'Item 1', description: 'Description for item 1' },
    { id: 2, name: 'Item 2', description: 'Description for item 2' },
    { id: 3, name: 'Item 3', description: 'Description for item 3' }
  ];
  
  res.json(data);
});

// Post example
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // In a real app, you would save this to a database
  console.log('Contact form submission:', { name, email, message });
  
  // Send success response
  res.json({ success: true, message: 'Message received' });
});

module.exports = router;