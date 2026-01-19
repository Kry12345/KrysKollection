const express = require("express");
const path = require("path");
const cors = require("cors");   
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Let Express parse JSON body (for POST requests)
app.use(cors({
    origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../../Public')));


// Use the routes defined in routes.js
app.use('/api', routes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});