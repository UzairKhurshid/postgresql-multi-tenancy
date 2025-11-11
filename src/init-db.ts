import "reflect-metadata";
import { AppDataSource } from "./data-source";

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Data Source initialized successfully!");
    console.log("✅ Tables synchronized (created/updated)");
    
    // Keep connection alive for a moment to ensure tables are created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await AppDataSource.destroy();
    console.log("✅ Connection closed");
  } catch (error) {
    console.error("❌ Error during Data Source initialization:", error);
    process.exit(1);
  }
}

initializeDatabase();
