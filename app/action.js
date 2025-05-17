"use server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
debugger;
console.log("Loaded DB URL:", process.env.DATABASE_URL);

/**
 * Save JSON data to the Neon database with formatted file name
 * @param {string} fileName - The base name of the file (e.g., "v103_onwards_manifest.json")
 * @param {object} formData - The JSON data to save
 */
export async function saveToDatabase(fileName, formData, createdAt, deviceModel) {
  debugger;
    try {
      // Insert the JSON data into the database
      await sql`
        INSERT INTO manifests (file_name, data, created_at, device_model)
        VALUES (${fileName}, ${JSON.stringify(formData)}, ${createdAt},${deviceModel})
      `;
      console.log("Data saved to database successfully!");
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  }

  export async function getFromDatabase(fileName) {
    try {
      // Retrieve the JSON data from the database
      const result = await sql`
        SELECT data FROM manifests WHERE file_name = ${fileName}
      `;
      return result.length > 0 ? result[0].data : null;
    } catch (error) {
      console.error("Error retrieving from database:", error);
      return null;
    }
  }

  export async function getAllManifests() {
    try {
      // Retrieve all manifests from the database
      const result = await sql`
        SELECT file_name, data, created_at, device_model FROM manifests ORDER BY created_at DESC
      `;
      return result;
    } catch (error) {
      console.error("Error retrieving manifests:", error);
      return [];
    }
  }

