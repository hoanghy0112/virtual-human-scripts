// This file exports utility functions for the WebSocket server project.

const { v4: uuidv4 } = require('uuid');

// Function to generate a unique ID for clients
const generateUniqueId = () => {
    return uuidv4();
};

// Function to format messages
const formatMessage = (username, message) => {
    return {
        username,
        message,
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    generateUniqueId,
    formatMessage
};