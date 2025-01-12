const { response } = require("express");
const pool = require("../config/db");

class User {
  // 1, Get all User
  static async getAllUsers() {
    const query = "SELECT * FROM users";
    try {
      const result = await pool.query(query);

      // Transform the result into the desired format
      const formattedUsers = result.rows.map((user) => ({
        intID: user.id,
        strName: user.name,
        strMobile: user.mobile_number,
        strEmail: user.email,
        strRemarks: user.remarks || "",
        intRole: user.role,
        strPicture: user.picture || "",
        dtCreated_at: user.created_at,
        dtUpdated_at: user.updated_at,
      }));

      return formattedUsers;
    } catch (error) {
      console.error("Error Getting users", error);
      throw error;
    }
  }
  //for login

  static async getLogin_email(email) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error fetching user data: " + error.message);
    }
  }
  //1 Get User against single Id
  static async getUserById(id) {
    const query = "SELECT * FROM users Where id=$1";

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error Getting on users", error);
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
  static async existingUserById(id) {
    const query = "SELECT * FROM users Where id=$1";
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return {
          success: true,
          message: "No users found",
          users: [], // Returning an empty array
        };
      }
      return {
        success: true,
        users: result.rows,
      };
    } catch (error) {
      console.error(
        "Error on getting User for existing email and user_name ",
        error
      );
      throw error;
    }
  }

  //4For User Deleting
  static async userDelete(id) {
    const query = "DELETE FROM users Where id=$1";
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount;
    } catch (error) {
      console.error("Having Erro on Delete the Users", error);
      throw error;
    }
  }
  //5 Creating User
  // For OTP  Generating of User otp
  static async creatingUser(data) {
    const role = data.role || 1; // Default to role '1' if not provided
    const query = `
        INSERT INTO users(
            name, mobile_number, email, password, picture, remarks, role
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;

    const values = [
      data.name, // $1 - name
      data.mobile_number, // $2 - mobile_number
      data.email, // $3 - email
      data.password, // $4 - password
      data.picture || "", // $5 - picture (can be empty string)
      data.remarks || "", // $6 - remarks (can be empty string)
      role, // $7 - role
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Return the first user from the returned rows
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  //Updating Users
  static async editUser(id, data) {
    const query = `
    UPDATE users SET
      role_id=$1, 
      user_group_id=$2, 
      user_name=$3, 
      first_name=$4, 
      last_name=$5, 
      gender=$6, 
      phone_number=$7,  
      image_path=$8, 
      device_type=$9, 
      device_platform=$10, 
      lattitude=$11, 
      longitude=$12, 
      verification_code=$13, 
      is_verified=$14, 
      is_active=$15, 
      fcm_token=$16 
    WHERE id=$17 
    RETURNING *`;

    const values = [
      data.role_id,
      data.user_group_id,
      data.user_name,
      data.first_name,
      data.last_name,
      data.gender,
      data.phone_number,
      data.image_path,
      data.device_type,
      data.device_platform,
      data.lattitude,
      data.longitude,
      data.verification_code,
      data.is_verified,
      data.is_active,
      data.fcm_token,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error when editing user:", error);
      throw error;
    }
  }

  static async existingUserByUser_email(email) {
    // Query the database to check if the email already exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0]; // Return the user if found
  }

  static async existingUserByMobileNumber(mobile_number) {
    // Query the database to check if the mobile number already exists
    const result = await pool.query(
      "SELECT * FROM users WHERE mobile_number = $1",
      [mobile_number]
    );
    return result.rows[0]; // Return the user if found
  }
  static async existingUserBYemailANDuser_name(email, user_name) {
    const query = "SELECT * FROM users Where email=$1 OR user_name=$2";
    try {
      const result = await pool.query(query, [email, user_name]);
      return result.rows[0];
    } catch (error) {
      console.error(
        "Error on getting User for existing email and user_name ",
        error
      );
      throw error;
    }
  }
  static async userLogin(identifier) {
    const query = "SELECT * FROM users WHERE user_name = $1 OR email = $1";
    try {
      const result = await pool.query(query, [identifier]);
      return result.rows[0]; // Return user if found
    } catch (error) {
      console.error("Error in Login", error);
      throw error;
    }
  }
}

module.exports = User;
