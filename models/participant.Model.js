const { response } = require("express");
const pool = require("../config/db");

class Participant {
  // 1, Get all events
  // Model
  static async getAllParticipant() {
    const query = `
    SELECT 
      ep.*, 
      e.event_name,
      e.event_certificate_file_path
    FROM 
      event_participants ep
    JOIN 
      events e ON ep.event_id = e.id
  `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error Getting participants with event_name", error);
      throw error;
    }
  }

  //1 Get User against single Id
  static async getParticipantById(id) {
    const query = `SELECT 
     ep.id,
    ep.event_id,
    ep.registration_date,
    ep.participant_name,
    ep.participant_phone_number,
    ep.participant_email,
    ep.participant_picture_file_path,
    ep.participant_remarks,
    ep.user_id,
    ep.created_at,
    ep.updated_at,
    e.event_name,
    e.event_from_date,
    e.event_certificate_file_path

FROM 
    event_participants ep
JOIN 
    events e
ON 
    ep.event_id = e.id
WHERE 
    ep.id = $1;`;

    try {
      const result = await pool.query(query, [id]);
      // return result.rows[0];
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error Getting on event_participants", error);
      throw error;
    }
  }

  //3For existing user on the base of Id
  static async existingParticipantByName(event_name) {
    const query = `SELECT * FROM event_participants WHERE event_name = $1 LIMIT 1`;
    const values = [event_name];

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error in checking existing event_participants:", error);
      throw error;
    }
  }

  //4For User Deleting
  static async participantDelete(id) {
    const query = "DELETE FROM event_participants Where id=$1";
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount;
    } catch (error) {
      console.error("Having Erro on Delete the Participant", error);
      throw error;
    }
  }
  //5 Creating User
  static async creatingParticipant(data, user_id) {
    console.log(
      "Creating participant with data:",
      data,
      "and user_id:",
      user_id
    );

    const query = `
    INSERT INTO event_participants (
      event_id,
      registration_date,
      participant_name,
      participant_phone_number,
      participant_email,
      participant_picture_file_path,
      participant_remarks,
      user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`;

    const values = [
      data.event_id,
      data.registration_date,
      data.participant_name,
      data.participant_phone_number,
      data.participant_email,
      data.participant_picture_file_path,
      data.participant_remarks || null,
      user_id,
    ];

    try {
      const result = await pool.query(query, values);
      console.log("Participant created successfully:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Database error during participant creation:", {
        query,
        values,
        error: error.message,
      });
      throw error;
    }
  }

  //Updating updateEvent
  static async updateParticipant(data, id) {
    const query = `
    UPDATE event_participants
    SET
       event_id=$1,
      registration_date=$2,
      participant_name=$3,
      participant_phone_number=$4,
      participant_email=$5,
      participant_picture_file_path=$6,
      participant_remarks=$7,
      user_id=$8
    WHERE id = $9
    RETURNING *`;

    const values = [
      data.event_id,
      data.registration_date,
      data.participant_name,
      data.participant_phone_number,
      data.participant_email,
      data.participant_picture_file_path || null,
      data.participant_remarks || null,
      data.user_id,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Database error during event_participants update:", error);
      throw error;
    }
  }
}

module.exports = Participant;
