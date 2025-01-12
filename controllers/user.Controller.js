const User = require("../models/user.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "eeeafbfdss";

//For Login
// exports.userLogin = async (req, res) => {
//   console.log("That is a bod", req.body);
//   const { user_name, password } = req.body;

//   // Validate required fields
//   if (!user_name || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "user_name, password are required",
//     });
//   }

//   const identifier = user_name;

//   try {
//     const existingUser = await User.userLogin(identifier);

//     if (!existingUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found Check also User cradentials",
//       });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(
//       password,
//       existingUser.password
//     );
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }
//     const token = jwt.sign(
//       { userId: existingUser.id, roleId: existingUser.role_id },
//       "eeeafbfdss"
//     );
//     // Respond with token and user data
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token: token,
//     });
//   } catch (error) {
//     console.error("Error in login", error);
//     res.status(500).json({
//       success: false,
//       message: "Login failed",
//       error: error.message,
//     });
//   }
// };

exports.userLogin = async (req, res) => {
  console.log("That is a body", req.body);
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Use email to find the user
    const existingUser = await User.getLogin_email(email);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found. Check your credentials.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: existingUser.id, role: existingUser.role },
      "your_secret_key", // Use a proper secret key here (ideally from environment variables)
      { expiresIn: "1h" } // Optional: Set the expiration time for the token
    );

    // Respond with token and user data (excluding password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Error in login", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json({
      success: true,
      message: "All Users fetch  successfully",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "All Users fetch  successfully",
      error: error.message,
    });
  }
};
//2 Get Single User Id
exports.getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.getUserById(req.params.id);
    console.log("That is a result", result);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "User against the id not found",
        data: id,
      });
    }
    res.status(200).json({
      success: true,
      message: "User Found Successfuly",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "User not Found",
      error: error.message,
    });
  }
};

//3 Delete User Id
exports.userDelete = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteUserCount = await User.userDelete(id);
    if (deleteUserCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No record found with that ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "User with ID " + id + " deleted successfully",
      data: id,
    });
  } catch (error) {
    console.error("Error while deleting the user", error);
    // Respond with a 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

exports.createNewUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  const { name, mobile_number, email, password, remarks, role } = req.body;

  if (!name || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, password.",
    });
  }

  try {
    // Check if the username already exists
    const existingUseremail = await User.existingUserByUser_email(email);
    if (existingUseremail) {
      return res.status(409).json({
        success: false,
        message: "User with that email is already registered.",
      });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data for insertion
    const data = {
      name,
      mobile_number,
      email,
      password: hashedPassword,
      remarks,
      role,
      picture: req.file ? req.file.path.replace(/\\/g, "/") : "", // Save the file path if uploaded
    };
    console.log("That is a Data that are comming", data);
    // Create the new user in the database
    const createdNewUser = await User.creatingUser(data);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createdNewUser,
    });
  } catch (err) {
    // Check for duplicate key error
    if (err.code === "23505" && err.detail.includes("mobile_number")) {
      // Return a specific error message for duplicate mobile number
      return res
        .status(400)
        .json({ message: "This mobile number is already registered." });
    }

    // Return a generic server error message for other errors
    return res
      .status(500)
      .json({ message: "Failed to create user due to server error." });
  }
};

// Updating End Point
exports.updateUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  let userid, roleid;

  try {
    // Extract and verify the token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decode = jwt.verify(token, secretKey);
      userid = decode.id;
      roleid = decode.role_id;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      } else if (error.name === "NotBeforeError") {
        return res.status(401).json({
          success: false,
          message: "Token is not active yet.",
        });
      } else {
        console.error("Unexpected error with token verification:", error);
        return res.status(500).json({
          success: false,
          message: "Unexpected error in token verification.",
        });
      }
    }

    if (!roleid) {
      return res.status(400).json({
        success: false,
        message: "Role ID is missing in the token.",
      });
    }

    const existingUser = await User.existingUserById(userid);

    const data = { ...existingUser, ...req.body };

    if (req.file) {
      data.image_path = `uploads/${
        roleid === 1 ? "patient" : "doctor"
      }/${userid}/${req.file.originalname}`;
    } else {
      data.image_path = existingUser.image_path;
    }

    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10);
    } else {
      data.password = existingUser.password;
    }

    const updatedUser = await User.updateUser(userid, data);
    let roleData;

    // Role-specific data update
    if (roleid === 1) {
      const existingPatientData = await Patient.getPatientById(userid);
      if (!existingPatientData) {
        return res.status(404).json({
          success: false,
          message: `Patient with ID ${userid} not found.`,
        });
      }
      const patientData = { ...existingPatientData, ...req.body };

      roleData = await Patient.editPatient(userid, patientData);
    } else if (roleid === 2) {
      const existingDoctorData = await Doctor.existingDoctorById(userid);
      if (!existingDoctorData) {
        return res.status(404).json({
          success: false,
          message: `Doctor with ID ${userid} not found.`,
        });
      }
      const doctorData = { ...existingDoctorData, ...req.body };
      roleData = await Doctor.updateDoctor(userid, doctorData);
    }

    res.status(201).json({
      success: true,
      message: "User and role-specific data updated successfully",
      data: { user: updatedUser, roleData: roleData },
    });
  } catch (error) {
    console.error("Error while updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

//For Validate Token
// For Validate Token
exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    let decoded;
    let user_id;
    try {
      decoded = jwt.verify(token, secretKey);
      console.log("Decoded Token:", decoded);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      } else {
        console.error("Unexpected token verification error:", error);
        return res.status(500).json({
          success: false,
          message: "Unexpected error in token verification.",
        });
      }
    }
    user_id = decoded.user_id;
    const user = await User.existingUserByid(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user_id: user_id,
      iat: decoded.iat,
      iss: "solhut.com",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
