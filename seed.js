const db = require("./SRC/config/db.js");

const createTables = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS Customer (
                customer_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Contact_Mech (
                contact_mech_id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                street_address VARCHAR(100) NOT NULL,
                city VARCHAR(50) NOT NULL,
                state VARCHAR(50) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                phone_number VARCHAR(20),
                email VARCHAR(100),
                FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Product (
                product_id INT AUTO_INCREMENT PRIMARY KEY,
                product_name VARCHAR(100) NOT NULL,
                color VARCHAR(30),
                size VARCHAR(10)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Order_Header (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                order_date DATE NOT NULL,
                customer_id INT NOT NULL,
                shipping_contact_mech_id INT NOT NULL,
                billing_contact_mech_id INT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
                FOREIGN KEY (shipping_contact_mech_id) REFERENCES Contact_Mech(contact_mech_id) ON DELETE CASCADE,
                FOREIGN KEY (billing_contact_mech_id) REFERENCES Contact_Mech(contact_mech_id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Order_Item (
                order_item_seq_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                status VARCHAR(20) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Order_Header(order_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
            )
        `);
    } catch (err) {
        console.error("Error creating tables:", err);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        await createTables();

        // Insert Customers
        const customers = [
            ["John", "Doe"],
            ["Jane", "Smith"]
        ];
        await db.query("INSERT INTO Customer (first_name, last_name) VALUES ?", [customers.map(c => [c[0], c[1]])]);

        // Fetch customer IDs
        const [customersData] = await db.query("SELECT customer_id FROM Customer");
        const johnId = customersData[0].customer_id;
        const janeId = customersData[1].customer_id;

        // Insert Contact Mechanisms
        const contactMechs = [
            [johnId, "1600 Amphitheatre Parkway", "Mountain View", "CA", "94043", "(650) 253-0000", "john.doe@example.com"],
            [johnId, "1 Infinite Loop", "Cupertino", "CA", "95014", "(408) 996-1010", "john.doe@work.com"],
            [janeId, "350 Fifth Avenue", "New York", "NY", "10118", "(212) 736-3100", "jane.smith@example.com"]
        ];
        await db.query(`
            INSERT INTO Contact_Mech (customer_id, street_address, city, state, postal_code, phone_number, email)
            VALUES ?`, [contactMechs.map(c => [c[0], c[1], c[2], c[3], c[4], c[5], c[6]])]);

        // Insert Products
        const products = [
            ["T-Shirt", "Red", "M"],
            ["Jeans", "Blue", "32"],
            ["Sneakers", "White", "9"],
            ["Jacket", "Black", "L"],
            ["Hat", "Green", "One Size"]
        ];
        await db.query("INSERT INTO Product (product_name, color, size) VALUES ?", [products.map(p => [p[0], p[1], p[2]])]);

        console.log('✅ Data successfully inserted!');
        process.exit();
    } catch (err) {
        console.error('Error inserting data:', err);
        process.exit(1);
    }
};

seedDatabase();