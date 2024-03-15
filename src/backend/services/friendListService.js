import pool from "./databaseService.js";


/**
 * Fetches all friendships(id1, id2, date). Use this to template fetch functions.
 * @returns results
 */
async function fetchFriendListFromDB() {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM Friendship");
      client.release();
      return result.rows;
    } catch (error) {
      console.error("Error fetching owners from the database:", error);
      throw error;
    }
  }
async function initiateOwners() {
// Add the tables you want to create.
    const createTableQueries = [
        "Owner (ownerID SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL)",
        "Owner_Name (ownerID INTEGER PRIMARY KEY, firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, FOREIGN KEY (ownerID) REFERENCES Owner (ownerID) ON DELETE CASCADE)",
        "Owner_Contact (email VARCHAR(255) PRIMARY KEY, phoneNumber VARCHAR(255) UNIQUE, FOREIGN KEY (email) REFERENCES Owner (email) ON DELETE CASCADE ON UPDATE CASCADE)",
    ];

    // Add the table names tht should be dropped. Should be the same tables on createTableQueries.
    const dropTables = ["Owner_Name", "Owner_Contact", "Owner"]; // Make sure the order is Dependent->Source. Remove tables that depends on another table.

    try {
        const client = await pool.connect();
        for (const table of dropTables) {
        await client.query(`DROP TABLE IF EXISTS ${table}`);
        }
        for (const query of createTableQueries) {
        await client.query(`CREATE TABLE IF NOT EXISTS ${query}`);
        }
        client.release();
        return true;
    } catch (error) {
        console.error("Error initializing owners:", error);
        throw error;
    }
    }

async function insertFriendship(ownerid1, ownerid2, dateoffriendship) {
    let client;
    try {
        client = await pool.connect();
    
        // Start transaction
        await client.query("BEGIN");
    
    
        const friendListInsertQuery =
        "INSERT INTO friendship (ownerid1, ownerid2, dateoffriendship) VALUES ($1, $2, $3)";
        const friendListInsertValues = [ownerid1, ownerid2, dateoffriendship];
        await client.query(friendListInsertQuery, friendListInsertValues);
    
        // Commit the transaction
        await client.query("COMMIT");
        return true;
    } catch (error) {
        // Rollback the transaction in case of error
        await client.query("ROLLBACK");
        console.error("Error inserting friendship:", error);
        throw error;
    } finally {
        if (client) {
        client.release();
        }
    }
    }

    export {
        fetchFriendListFromDB,
        initiateOwners,
        insertFriendship,
        //deleteFriendship,
    }
    