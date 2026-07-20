import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    database: process.env.DB_DATABASE || "tnp_database",
    password: process.env.DB_PASSWORD || "db_password",
});

export default pool;

