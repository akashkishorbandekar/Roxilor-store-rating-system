
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
    path: envPath,
    override: true
});

const mysql = require("mysql2/promise");

console.log("Database configuration loaded:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    passwordLength: process.env.DB_PASSWORD?.length
});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await db.getConnection();

        console.log("MySQL Database Connected Successfully!");

        connection.release();
    } catch (error) {
        console.error("Database Connection Failed!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
    }
};

module.exports = {
    db,
    testConnection
};
