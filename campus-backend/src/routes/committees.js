const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

// GET ALL COMMITTEES
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM committees ORDER BY created_at DESC");
        res.json({ committees: result.rows });
    } catch (error) {
        console.error("Get committees error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET COMMITTEE BY ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM committees WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Committee not found" });
        }

        res.json({ committee: result.rows[0] });
    } catch (error) {
        console.error("Get committee error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// CREATE COMMITTEE (Protected)
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Committee name is required" });
        }

        const result = await pool.query(
            `INSERT INTO committees (name, description) VALUES ($1, $2) RETURNING *`,
            [name, description || null]
        );

        res.status(201).json({
            message: "Committee created successfully",
            committee: result.rows[0],
        });
    } catch (error) {
        console.error("Create committee error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;