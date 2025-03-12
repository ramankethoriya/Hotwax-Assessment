const db = require('./db');

const seedDatabase = async () => {
    try {
        // Insert Customers
        const customers = [
            ["John", "Doe"],
            ["Jane", "Smith"]
        ];
        await db.promise().query("INSERT INTO Customer (first_name, last_name) VALUES ?", [customers]);

        // Fetch customer IDs
        const [customersData] = await db.promise().query("SELECT customer_id FROM Customer");
        const johnId = customersData[0].customer_id;
        const janeId = customersData[1].customer_id;

        // Insert Contact Mechanisms
        const contactMechs = [
            [johnId, "1600 Amphitheatre Parkway", "Mountain View", "CA", "94043", "(650) 253-0000", "john.doe@example.com"],
            [johnId, "1 Infinite Loop", "Cupertino", "CA", "95014", "(408) 996-1010", "john.doe@work.com"],
            [janeId, "350 Fifth Avenue", "New York", "NY", "10118", "(212) 736-3100", "jane.smith@example.com"]
        ];
        await db.promise().query(`
            INSERT INTO Contact_Mech (customer_id, street_address, city, state, postal_code, phone_number, email)
            VALUES ?`, [contactMechs]);

        // Insert Products
        const products = [
            ["T-Shirt", "Red", "M"],
            ["Jeans", "Blue", "32"],
            ["Sneakers", "White", "9"],
            ["Jacket", "Black", "L"],
            ["Hat", "Green", "One Size"]
        ];
        await db.promise().query("INSERT INTO Product (product_name, color, size) VALUES ?", [products]);

        console.log('✅ Data successfully inserted!');
        process.exit();
    } catch (err) {
        console.error('Error inserting data:', err);
        process.exit(1);
    }
};

seedDatabase();
