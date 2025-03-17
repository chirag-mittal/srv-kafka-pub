require('./import_env.js');

const express = require('express');
const bodyParser = require('body-parser');
const { connect, send } = require("./src/core/index.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Global variable to store the Kafka connection
let kafkaConnected = false;

// Connect to Kafka when the server starts
connect()
  .then(() => {
    console.log('Successfully connected to Kafka');
    kafkaConnected = true;
  })
  .catch(err => {
    console.error('Failed to connect to Kafka:', err);
  });

app.get('/api/kafka/_health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kafka connection is healthy'
  });
});

// POST endpoint to send messages to Kafka
app.post('/api/kafka/send', async (req, res) => {
  try {
    // Validate request body
    const { topic, messages } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty' });
    }
    
    // Check if Kafka is connected with retries
    let retries = 0;
    const maxRetries = 3;
    
    while (!kafkaConnected && retries < maxRetries) {
      console.log(`Kafka not connected, retrying (${retries + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
      retries++;
    }
    
    if (!kafkaConnected) {
      return res.status(503).json({ error: 'Kafka connection not established after multiple attempts' });
    }
    
    // Send message to Kafka
    const result = await send({
      topic,
      messages,
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      result
    });
    
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message to Kafka'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For testing purposes, you can keep this or remove it
// connect().then(async ()=>{
//   await send({
//     topic: "dev.test",
//     messages: [{ value: "Hello World" }],
//   });
//   console.log("Sent test message to Kafka");
// });