/**
 * Helper to load .env file before importing modules that use env validation
 */

import { readFileSync } from "fs";
import { join } from "path";

export function loadEnv() {
  try {
    const envPath = join(process.cwd(), ".env");
    const envFile = readFileSync(envPath, "utf-8");
    const envVars: Record<string, string> = {};
    
    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    });
    
    // Set process.env for missing variables
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    // .env file might not exist, that's okay
  }
}

// Load immediately when this module is imported
loadEnv();


