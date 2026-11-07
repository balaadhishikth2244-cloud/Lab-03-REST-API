
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Import Books REST API routes
const booksRouter = require("./routes/books");

// Middleware to read JSON data
app.use(express.json());

// Home route - Display server running message
app.get("/", (req, res) => {
    res.status(200).send("Server is running successfully!");
});

// Health Check API
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running successfully",
        timestamp: new Date().toISOString()
    });
});

// Books REST API routes
app.use("/books", booksRouter);

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
