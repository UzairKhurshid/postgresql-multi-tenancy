import { DataSource } from "typeorm";
import "reflect-metadata";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432"),
  username: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "12345678",
  database: process.env.PGDATABASE || "workflow-builder",
  synchronize: true,
  logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});
