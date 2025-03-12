require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./SRC/config/db.js");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello!");
});

// **Create Order**
app.post("/orders", async (req, res) => {
    try {
        const { order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id, order_items } = req.body;

        // Insert order
        const [orderResult] = await db.query(
            `INSERT INTO Order_Header (order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id) VALUES (?, ?, ?, ?)`,
            [order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        if (order_items && order_items.length > 0) {
            const values = order_items.map(item => [orderId, item.product_id, item.quantity, item.status]);
            await db.query(
                `INSERT INTO Order_Item (order_id, product_id, quantity, status) VALUES ?`,
                [values]
            );
        }

        res.status(201).json({ message: "Order created", order_id: orderId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Retrieve Order**
app.get("/orders/:order_id", async (req, res) => {
    try {
        const orderId = req.params.order_id;

        const [orderResult] = await db.query(
            `SELECT o.*, c.first_name, c.last_name 
             FROM Order_Header o
             JOIN Customer c ON o.customer_id = c.customer_id
             WHERE o.order_id = ?`,
            [orderId]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const [itemsResult] = await db.query(
            `SELECT * FROM Order_Item WHERE order_id = ?`,
            [orderId]
        );

        res.status(200).json({ order: orderResult[0], items: itemsResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Update Order**
app.put("/orders/:order_id", async (req, res) => {
    try {
        const orderId = req.params.order_id;
        const { shipping_contact_mech_id, billing_contact_mech_id } = req.body;

        await db.query(
            `UPDATE Order_Header SET shipping_contact_mech_id = ?, billing_contact_mech_id = ? WHERE order_id = ?`,
            [shipping_contact_mech_id, billing_contact_mech_id, orderId]
        );

        res.status(200).json({ message: "Order updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Delete Order**
app.delete("/orders/:order_id", async (req, res) => {
    try {
        const orderId = req.params.order_id;
        await db.query(`DELETE FROM Order_Header WHERE order_id = ?`, [orderId]);
        res.status(200).json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Add Order Item**
app.post("/orders/:order_id/items", async (req, res) => {
    try {
        const orderId = req.params.order_id;
        const { product_id, quantity, status } = req.body;

        await db.query(
            `INSERT INTO Order_Item (order_id, product_id, quantity, status) VALUES (?, ?, ?, ?)`,
            [orderId, product_id, quantity, status]
        );

        res.status(201).json({ message: "Order item added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Update Order Item**
app.put("/orders/:order_id/items/:order_item_seq_id", async (req, res) => {
    try {
        const { order_id, order_item_seq_id } = req.params;
        const { quantity, status } = req.body;

        await db.query(
            `UPDATE Order_Item SET quantity = ?, status = ? WHERE order_item_seq_id = ? AND order_id = ?`,
            [quantity, status, order_item_seq_id, order_id]
        );

        res.status(200).json({ message: "Order item updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Delete Order Item**
app.delete("/orders/:order_id/items/:order_item_seq_id", async (req, res) => {
    try {
        const { order_id, order_item_seq_id } = req.params;

        await db.query(
            `DELETE FROM Order_Item WHERE order_item_seq_id = ? AND order_id = ?`,
            [order_item_seq_id, order_id]
        );

        res.status(200).json({ message: "Order item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Start Server**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
