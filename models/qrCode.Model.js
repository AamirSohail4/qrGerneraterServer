const { response } = require("express");
const pool = require("../config/db");

class QRCode {
  // 1, Get all events
  static async getAllQRCode() {
    const query = "SELECT * FROM qr_codes";
    try {
      const result = await pool.query(query);
      // Transform the result into the desired format
      const formattedUsers = result.rows.map((qrcode) => ({
        intID: qrcode.id,
        strCode: qrcode.code,
        strRemarks: qrcode.remarks,
        dtLastScanned_at: qrcode.last_scanned_at,
        intScaneCount: qrcode.scan_count,
        dtCreated_at: qrcode.created_at,
      }));

      return formattedUsers;
    } catch (error) {
      console.error("Error Getting on users", error);
      throw error;
    }
  }

  //1 Get User against single Id
  static async geteventById(id) {
    const query = "SELECT * FROM events WHERE id = $1";
    try {
      const result = await pool.query(query, [id]);
      console.log("Query Result:", result.rows);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error getting event:", error.message);
      throw error;
    }
  }

  //2 Update user
  static async updateUser(id, data) {
    const query = `
      UPDATE "users" SET first_name=$1, last_name=$2, gender=$3, email=$4, password=$5, image_path=$6 
      WHERE id=$7 
      RETURNING *`;
    const values = [
      data.first_name,
      data.last_name,
      data.gender,
      data.email,
      data.password,
      data.image_path,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      console.log("User updated:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error when updating user:", error);
      throw error;
    }
  }

  //3For existing user on the base of Id
  static async existingEventByName(event_name) {
    const query = `SELECT * FROM events WHERE event_name = $1 LIMIT 1`;
    const values = [event_name];

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error in checking existing events:", error);
      throw error;
    }
  }

  //4For User Deleting
  static async QRCodeDelete(id) {
    const query = "DELETE FROM qr_codes Where id=$1";
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount;
    } catch (error) {
      console.error("Having Erro on Delete the event", error);
      throw error;
    }
  }
  //5 Creating User
  // static async createQrCode(data) {
  //   const query = `
  //     INSERT INTO qr_codes (
  //       code, created_at, last_scanned_at, scan_count
  //     ) VALUES ($1, NOW(), $2, $3)
  //     RETURNING *`;

  //   // Use 0 for scan_count instead of null or an empty string.
  //   const values = [
  //     data.strCode, // The strCode from the request body
  //     null, // Set last_scanned_at to NULL
  //     0, // Set scan_count to 0 (default value)
  //   ];

  //   console.log("Executing query:", query); // Log query
  //   console.log("With values:", values); // Log values

  //   try {
  //     const result = await pool.query(query, values);
  //     return result.rows[0]; // Return the newly inserted QR code
  //   } catch (error) {
  //     console.error("Database error during QR code creation:", error);
  //     throw error; // Rethrow to handle in controller
  //   }
  // }

  static async createQrCodes(codes, remarks) {
    const query = `
      INSERT INTO qr_codes (code, created_at, last_scanned_at, scan_count,remarks)
      VALUES ($1, NOW(), $2, $3 ,$4)
      RETURNING *`;

    // Default values for last_scanned_at and scan_count
    const values = [];
    const currentTime = null;
    const scanCount = 0;

    // for (const code of codes) {
    //   values.push([code, currentTime, scanCount]); // Array of value sets
    // }
    for (const code of codes) {
      // Check if remarks is provided, otherwise use a default value (e.g., empty string)
      const remark = remarks || "";
      values.push([code, currentTime, scanCount, remark]); // Include remarks in the values
    }
    console.log("Executing query:", query); // Log query

    try {
      const result = await Promise.all(
        values.map((value) => pool.query(query, value))
      );
      return result.map((res) => res.rows[0]); // Return all newly inserted QR codes
    } catch (error) {
      console.error("Database error during QR code creation:", error);
      throw error; // Rethrow to handle in controller
    }
  }
  //Updating updateEvent
  static async updateEvent(data, id, user_id) {
    const query = `
    UPDATE events
    SET
      event_name = $1,
      event_from_date = $2,
      event_to_date = $3,
      event_location = $4,
      event_certificate_file_path = $5,
      event_banner_file_path = $6,
      is_active = $7,
      user_id = $8
    WHERE id = $9
    RETURNING *`;

    const values = [
      data.event_name,
      data.event_from_date,
      data.event_to_date,
      data.event_location,
      data.event_certificate_file_path,
      data.event_banner_file_path || null,
      data.is_active,
      user_id,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Database error during event update:", error);
      throw error;
    }
  }

  static async existingUserByUser_name(user_name) {
    const query = "SELECT * FROM users Where user_name=$1";
    try {
      const userResult = await pool.query(query, [user_name]);
      return userResult.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async existingUserByUser_email(email) {
    const query = "SELECT * FROM users Where email=$1";
    try {
      const userResult = await pool.query(query, [email]);
      return userResult.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
  //Creating Key Values
  //5 Creating User
  static async createKeyValue(data) {
    const query = `
      INSERT INTO key_values (type, key, value)
      VALUES ($1, $2, $3)
      RETURNING id, type, key, value, created_at, updated_at
    `;
    const values = [
      data.strType, // Type of the key-value pair
      data.strKey, // Key
      data.strValue, // Value
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting key-value pair:", error);
      throw error;
    }
  }

  // Get a key-value pair by its key
  static async getKeyValueByKey(strKey) {
    const query = `
      SELECT id, type, key, value, created_at, updated_at
      FROM key_values
      WHERE key = $1
    `;
    const values = [strKey];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Return the key-value pair if found
    } catch (error) {
      console.error("Error retrieving key-value pair:", error);
      throw error;
    }
  }
  //1 Get User against single Id
  static async getScanLog(strCode) {
    const query = "SELECT * FROM scan_logs WHERE code = $1";
    try {
      const result = await pool.query(query, [strCode]);
      return result.rows;
    } catch (error) {
      console.error("Error getting Scan Logs:", error.message);
      throw error;
    }
  }

  static async getSummary(strCode, dtFromDate, dtToDate) {
    let query = `SELECT * FROM qr_codes WHERE 1=1`; // `1=1` allows appending conditions dynamically
    const params = [];

    if (strCode) {
      query += ` AND code = $${params.length + 1}`;
      params.push(strCode);
    }

    if (dtFromDate && dtToDate) {
      query += ` AND created_at BETWEEN $${params.length + 1} AND $${
        params.length + 2
      }`;
      params.push(dtFromDate, dtToDate);
    } else if (dtFromDate) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(dtFromDate);
    } else if (dtToDate) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(dtToDate);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Error getting QR Code summary:", error.message);
      throw error;
    }
  }
}

module.exports = QRCode;
