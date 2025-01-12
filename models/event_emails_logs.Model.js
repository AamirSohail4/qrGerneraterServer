const { response } = require("express");
const pool = require("../config/db");

class Event_Email {
  // 1, Get all events
  static async getAllevent_emails_logs() {
    const query = "SELECT * FROM event_emails_logs";
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error Getting on event_emails_logs", error);
      throw error;
    }
  }

  //5 Creating Email Logs
  static async creatingEmailLogs(data) {
    const query = `
    INSERT INTO event_emails_logs (
      event_id,
      participant_id,
      participant_email
    ) VALUES ($1, $2, $3)
    RETURNING *`;

    const values = [data.event_id, data.participant_id, data.participant_email];

    try {
      const result = await pool.query(query, values);
      console.log("Event email log created successfully:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Database error during event_emails_logs creation:", {
        query,
        values,
        error: error.message,
      });
      throw error;
    }
  }
  //Creating Event Certificate Printing logs
  //5 Creating User
  static async CreatecertificatePrinting(data) {
    const query = `
    INSERT INTO event_certificate_print_logs (
      event_id,
      participant_id,
      user_id
    ) VALUES ($1, $2, $3)
    RETURNING *`;

    const values = [data.event_id, data.participant_id, data.user_id];

    try {
      const result = await pool.query(query, values);
      console.log(
        "Event certificate printing log created successfully:",
        result.rows[0]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        "Database error during event certificate printing log creation:",
        {
          query,
          values,
          error: error.message,
        }
      );
      throw error;
    }
  }

  // For Report Section Fucntions
  //   static async getEventParticipantsReport(filters) {
  //     const {
  //       event_name,
  //       participant_name,
  //       mobile_number,
  //       email,
  //       from_date,
  //       to_date,
  //     } = filters;

  //     let query = `
  //     SELECT
  //       ep.registration_date,
  //       e.event_name,
  //       ep.participant_name,
  //       ep.participant_phone_number,
  //       ep.participant_email
  //     FROM event_participants ep
  //     JOIN events e ON ep.event_id = e.id
  //     WHERE 1 = 1`;

  //     const values = [];

  //     // Apply filters if they exist
  //     if (event_name) {
  //       query += ` AND e.event_name ILIKE $${values.length + 1}`;
  //       values.push(`%${event_name}%`); // Case-insensitive search
  //     }

  //     if (participant_name) {
  //       query += ` AND ep.participant_name ILIKE $${values.length + 1}`;
  //       values.push(`%${participant_name}%`);
  //     }

  //     if (mobile_number) {
  //       query += ` AND ep.participant_phone_number ILIKE $${values.length + 1}`;
  //       values.push(`%${mobile_number}%`);
  //     }

  //     if (email) {
  //       query += ` AND ep.participant_email ILIKE $${values.length + 1}`;
  //       values.push(`%${email}%`);
  //     }

  //     if (from_date) {
  //       query += ` AND ep.registration_date >= $${values.length + 1}`;
  //       values.push(from_date); // Ensure date is in 'YYYY-MM-DD' format
  //     }

  //     if (to_date) {
  //       query += ` AND ep.registration_date <= $${values.length + 1}`;
  //       values.push(to_date); // Ensure date is in 'YYYY-MM-DD' format
  //     }

  //     try {
  //       const result = await pool.query(query, values);
  //       return result.rows; // Return the results of the query
  //     } catch (error) {
  //       throw new Error(
  //         "Error while fetching event participants report: " + error.message
  //       );
  //     }
  //   }
  static async getEventParticipantsReport(filters) {
    const {
      event_name,
      participant_name,
      mobile_number,
      email,
      from_date,
      to_date,
    } = filters;

    let query = `
  SELECT
   ep.id,
    ep.registration_date,
    e.event_name,
    ep.participant_name,
    ep.participant_phone_number,
    ep.participant_email
  FROM event_participants ep
  JOIN events e ON ep.event_id = e.id
  WHERE 1 = 1`;

    const values = [];
    if (event_name) {
      query += ` AND e.event_name ILIKE $${values.length + 1}`;
      values.push(`%${event_name}%`);
    }

    if (participant_name) {
      query += ` AND ep.participant_name ILIKE $${values.length + 1}`;
      values.push(`%${participant_name}%`);
    }

    if (mobile_number) {
      query += ` AND ep.participant_phone_number ILIKE $${values.length + 1}`;
      values.push(`%${mobile_number}%`);
    }

    if (email) {
      query += ` AND ep.participant_email ILIKE $${values.length + 1}`;
      values.push(`%${email}%`);
    }

    if (from_date) {
      query += ` AND ep.registration_date >= $${values.length + 1}`;
      values.push(from_date);
    }

    if (to_date) {
      query += ` AND ep.registration_date <= $${values.length + 1}`;
      values.push(to_date);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Error while fetching event participants report: " + error.message
      );
    }
  }

  // For Event sumary
  static async getEventSummary(filters) {
    const { event_name, from_date, to_date } = filters;

    let query = `
      SELECT 
        e.id AS event_id,
        e.event_name,
        COUNT(ep.id) AS participants_count
      FROM events e
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      WHERE e.is_active = 1`; // Filter only active events

    const values = [];

    if (event_name) {
      query += ` AND e.event_name ILIKE $${values.length + 1}`;
      values.push(`%${event_name}%`);
    }

    if (from_date) {
      query += ` AND e.event_from_date >= $${values.length + 1}`;
      values.push(from_date);
    }

    if (to_date) {
      query += ` AND e.event_to_date <= $${values.length + 1}`;
      values.push(to_date);
    }

    query += `
      GROUP BY e.id, e.event_name
      ORDER BY participants_count DESC`;

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error("Error fetching event summary: " + error.message);
    }
  }
}

module.exports = Event_Email;
