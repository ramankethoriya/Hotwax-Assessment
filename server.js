require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'ecommerce'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Create Order
app.post('/orders', (req, res) => {
    const { order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id, order_items } = req.body;

    const sql = `INSERT INTO Order_Header (order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id) VALUES (?, ?, ?, ?)`;
    db.query(sql, [order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;
        const orderItemsSQL = `INSERT INTO Order_Item (order_id, product_id, quantity, status) VALUES ?`;
        const values = order_items.map(item => [orderId, item.product_id, item.quantity, item.status]);

        db.query(orderItemsSQL, [values], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Order created', order_id: orderId });
        });
    });
});

// Retrieve Order
app.get('/orders/:order_id', (req, res) => {
    const orderId = req.params.order_id;

    const sql = `
        SELECT o.*, c.first_name, c.last_name 
        FROM Order_Header o
        JOIN Customer c ON o.customer_id = c.customer_id
        WHERE o.order_id = ?`;

    db.query(sql, [orderId], (err, orderResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (orderResult.length === 0) return res.status(404).json({ error: 'Order not found' });

        const itemsSQL = `SELECT * FROM Order_Item WHERE order_id = ?`;
        db.query(itemsSQL, [orderId], (err, itemsResult) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({ order: orderResult[0], items: itemsResult });
        });
    });
});

// Update Order
app.put('/orders/:order_id', (req, res) => {
    const orderId = req.params.order_id;
    const { shipping_contact_mech_id, billing_contact_mech_id } = req.body;

    const sql = `UPDATE Order_Header SET shipping_contact_mech_id = ?, billing_contact_mech_id = ? WHERE order_id = ?`;
    db.query(sql, [shipping_contact_mech_id, billing_contact_mech_id, orderId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Order updated' });
    });
});

// Delete Order
app.delete('/orders/:order_id', (req, res) => {
    const orderId = req.params.order_id;
    db.query(`DELETE FROM Order_Header WHERE order_id = ?`, [orderId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Order deleted' });
    });
});

// Add Order Item
app.post('/orders/:order_id/items', (req, res) => {
    const orderId = req.params.order_id;
    const { product_id, quantity, status } = req.body;

    const sql = `INSERT INTO Order_Item (order_id, product_id, quantity, status) VALUES (?, ?, ?, ?)`;
    db.query(sql, [orderId, product_id, quantity, status], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Order item added' });
    });
});

// Update Order Item
app.put('/orders/:order_id/items/:order_item_seq_id', (req, res) => {
    const { order_id, order_item_seq_id } = req.params;
    const { quantity, status } = req.body;

    const sql = `UPDATE Order_Item SET quantity = ?, status = ? WHERE order_item_seq_id = ? AND order_id = ?`;
    db.query(sql, [quantity, status, order_item_seq_id, order_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Order item updated' });
    });
});

// Delete Order Item
app.delete('/orders/:order_id/items/:order_item_seq_id', (req, res) => {
    const { order_id, order_item_seq_id } = req.params;

    db.query(`DELETE FROM Order_Item WHERE order_item_seq_id = ? AND order_id = ?`, [order_item_seq_id, order_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Order item deleted' });
    });
});

// Start Server
app.listen(3000, () => console.log('Server running on port 3000'));
