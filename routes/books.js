
const express = require("express");
const router = express.Router();
const db = require("../database/db");

// GET /books - Get all books with search, sorting, pagination and price filter
router.get("/", (req, res) => {
    const {
        search_q = "",
        order_by = "id",
        order = "ASC",
        limit = "10",
        offset = "0",
        min_price,
        max_price
    } = req.query;

    const allowedColumns = ["id", "title", "author", "price"];

    const sortColumn = allowedColumns.includes(order_by)
        ? order_by
        : "id";

    const sortOrder = order.toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const pageLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const pageOffset = Math.max(parseInt(offset) || 0, 0);

    // Validate price filters
    if (
        (min_price !== undefined &&
            (!Number.isFinite(Number(min_price)) || Number(min_price) < 0)) ||
        (max_price !== undefined &&
            (!Number.isFinite(Number(max_price)) || Number(max_price) < 0))
    ) {
        return res.status(400).json({
            error: "Price filters must be valid non-negative numbers"
        });
    }

    if (
        min_price !== undefined &&
        max_price !== undefined &&
        Number(min_price) > Number(max_price)
    ) {
        return res.status(400).json({
            error: "min_price cannot be greater than max_price"
        });
    }

    let sql = "SELECT * FROM books WHERE title LIKE ?";
    const params = [`%${search_q}%`];

    if (min_price !== undefined) {
        sql += " AND price >= ?";
        params.push(Number(min_price));
    }

    if (max_price !== undefined) {
        sql += " AND price <= ?";
        params.push(Number(max_price));
    }

    sql += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(pageLimit, pageOffset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: "Database error"
            });
        }

        res.status(200).json({
            message: "Books fetched successfully",
            count: rows.length,
            data: rows
        });
    });
});

// GET /books/:id - Get one book by ID
router.get("/:id", (req, res) => {
    db.get(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
        (err, book) => {
            if (err) {
                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (!book) {
                return res.status(404).json({
                    error: "Book not found"
                });
            }

            res.status(200).json({
                message: "Book fetched successfully",
                data: book
            });
        }
    );
});

// POST /books - Create a new book
router.post("/", (req, res) => {
    const { title, author, price } = req.body;

    if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        price === undefined || price === null ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        return res.status(400).json({
            error: "Valid title, author and non-negative numeric price are required"
        });
    }

    db.run(
        "INSERT INTO books (title, author, price) VALUES (?, ?, ?)",
        [title.trim(), author.trim(), price],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: "Failed to add book"
                });
            }

            res.status(201).json({
                message: "Book created successfully",
                id: this.lastID
            });
        }
    );
});

// PUT /books/:id - Update a book
router.put("/:id", (req, res) => {
    const { title, author, price } = req.body;

    if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        price === undefined || price === null ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        return res.status(400).json({
            error: "Valid title, author and non-negative numeric price are required"
        });
    }

    db.run(
        "UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?",
        [title.trim(), author.trim(), price, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: "Failed to update book"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Book not found"
                });
            }

            res.status(200).json({
                message: "Book updated successfully"
            });
        }
    );
});

// DELETE /books/:id - Delete a book
router.delete("/:id", (req, res) => {
    db.run(
        "DELETE FROM books WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: "Failed to delete book"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Book not found"
                });
            }

            res.status(200).json({
                message: "Book deleted successfully"
            });
        }
    );
});

module.exports = router;
