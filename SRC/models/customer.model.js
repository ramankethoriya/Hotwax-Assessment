const db = require("../config/db");

const createCustomerTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Customer (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL
    )
  `);
};

module.exports = { createCustomerTable };
