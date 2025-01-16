const { response } = require("express");
const pool = require("../config/db");

class User {
  static async getAllUsers() {
    const query = `
      SELECT 
        users.*, 
        user_group.groupname 
      FROM 
        users
      LEFT JOIN 
        user_group 
      ON 
        users.user_group_id = user_group.id
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error Getting users:", error);
      throw error;
    }
  }

  //for login

  static async getLogin_email(email) {
    try {
      const result = await pool.query(
        `SELECT 
        users.*, 
        user_group.groupname 
      FROM 
        users
      LEFT JOIN 
        user_group 
      ON 
        users.user_group_id = user_group.id WHERE email = $1`,
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error("Error fetching user data: " + error.message);
    }
  }
  //1 Get User against single Id
  static async getUserById(id) {
    const query = `
      SELECT 
        users.*, 
        user_group.groupname 
      FROM 
        users
      LEFT JOIN 
        user_group 
      ON 
        users.user_group_id = user_group.id 
      WHERE 
        users.id = $1`; // Query based on the user's ID

    try {
      const result = await pool.query(query, [id]); // Pass the ID as a parameter
      return result.rows[0]; // Return the first matching row
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  // static async getUserById(id) {
  //   const query =  `SELECT
  //   users.*,
  //   user_group.groupname
  // FROM
  //   users
  // LEFT JOIN
  //   user_group
  // ON
  //   users.user_group_id = user_group.id WHERE email = $1`,
  //   [id];

  //   try {
  //     const result = await pool.query(query, [id]);
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error("Error Getting on users", error);
  //     throw error;
  //   }
  // }
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

  static async creatingNewUser(data) {
    console.log("That is a data", data);
    const query = `
        INSERT INTO users(
            name, mobile, email, password, picture, remarks, user_group_id
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;

    const values = [
      data.name,
      data.mobile,
      data.email,
      data.password,
      data.picture || "",
      data.remarks || "",
      data.user_group_id,
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
        name = COALESCE($1, name), 
        mobile = COALESCE($2, mobile),
        email = COALESCE($3, email),
        picture = COALESCE($4, picture),
        remarks = COALESCE($5, remarks),
        user_group_id = COALESCE($6, user_group_id)
      WHERE id = $7
      RETURNING *`;

    const values = [
      data.name || null,
      data.mobile || null,
      data.email || null,
      data.picture || null,
      data.remarks || null,
      data.user_group_id || null,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("User not found or no changes made.");
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error when editing user:", error);
      throw error;
    }
  }

  static async existingUsergroup(groupname) {
    const query = `
        SELECT * FROM user_group
        WHERE groupname = $1
        LIMIT 1`;

    const values = [groupname];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Return the matching group, if found
    } catch (error) {
      console.error("Error checking for existing user group:", error);
      throw error;
    }
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

  //User Group
  static async getAllUserGroups() {
    const query = "SELECT * FROM user_group";
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw error;
    }
  }
  static async userGroupDelete(id) {
    const query = "DELETE FROM user_group Where id=$1";
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount;
    } catch (error) {
      console.error("Having Erro on Delete the user Group", error);
      throw error;
    }
  }
  //Chack User By  Email
  static async existingUserBYemail(email) {
    const query = "SELECT * FROM users Where email=$1";
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error("Error on getting User for existing email ", error);
      throw error;
    }
  }

  //1 Get User against single Id
  static async getUser_groupById(id) {
    const query = "SELECT * FROM user_group Where id=$1";

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error Getting on user_group", error);
      throw error;
    }
  }

  //creating user group
  static async creatingUser_group(data) {
    const query = `
        INSERT INTO user_group (
            groupname
        ) 
        VALUES ($1)
        RETURNING *`;

    const values = [
      data.groupname, // $1 - groupname
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Return the first group from the returned rows
    } catch (error) {
      console.error("Error creating user group:", error);
      throw error;
    }
  }

  //Edit User Group Model
  // static async editUser_group(id, data) {
  //   const query = `
  //   UPDATE user_group SET
  //     groupname=$1
  //        WHERE id=$2
  //   RETURNING *`;

  //   const values = [data.groupname, id];

  //   try {
  //     const result = await pool.query(query, values);
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error("Error when editing user:", error);
  //     throw error;
  //   }
  // }
  // //1 Get User against single Id
  // static async getUser_groupById(id) {
  //   const query = "SELECT * FROM user_group Where id=$1";

  //   try {
  //     const result = await pool.query(query, [id]);
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error("Error Getting on user_group", error);
  //     throw error;
  //   }
  // }
  // Check if the groupname exists in the table, excluding the current id
  static async checkGroupnameExists(groupname, currentId) {
    const query = "SELECT * FROM user_group WHERE groupname = $1 AND id != $2";

    try {
      const result = await pool.query(query, [groupname, currentId]);
      // If any record is found, it means the groupname already exists
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking groupname:", error);
      throw error;
    }
  }

  static async editUser_group(id, data) {
    const query = `
      UPDATE user_group SET
        groupname = $1
      WHERE id = $2
      RETURNING *`;

    const values = [data.groupname, id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error when editing user:", error);
      throw error;
    }
  }
}

module.exports = User;
