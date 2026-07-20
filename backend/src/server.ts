import app from "./app.js";
import prisma from "./config/db.prisma.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // const connection = await pool.getConnection();
    // console.log("Database Connected Successfully");
    // connection.release();

    await prisma.$connect();
    console.log("Database Connected Successfully");
    await prisma.$disconnect();

    app.listen(PORT, () => {
      console.log(`Server Running at Port: ${PORT}`)
    })
  } catch (error) {
    console.error(`Database Connection Error: ${error}`)
    process.exit(1);
  }
}

startServer();