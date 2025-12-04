import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  DATABASE_URL: process.env.DATABASE_URL || "",

  ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS === "true"
};

