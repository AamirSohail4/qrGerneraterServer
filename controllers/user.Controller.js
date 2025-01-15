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
    console.log("That is a existingUser=> data", existingUser);

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
      { userId: existingUser.id, role: existingUser.groupname },
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
        role: existingUser.groupname,
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

    // Map through users to format the response
    const formattedUsers = users.map((user) => ({
      intID: user.id,
      strName: user.name,
      strMobile: user.mobile,
      strEmail: user.email,
      strRemarks: user.remarks || "",
      strPicture: user.picture || "",
      dtCreated_at: user.created_at,
      dtUpdated_at: user.updated_at,
      strGroupName: user.groupname || "",
      intGroupID: user.id,
    }));

    res.status(200).json({
      success: true,
      message: "success",
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
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

exports.registerNewUser = async (req, res) => {
  console.log("That is a Controlloer", req.body);
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  const { name, mobile, email, password, remarks, user_group_id } = req.body;

  if (!name || !password || !email || !user_group_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, password,user_group_id.",
    });
  }

  try {
    // Check if the username already exists
    const existingUseremail = await User.existingUserBYemail(email);
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
      mobile,
      email,
      password: hashedPassword,
      remarks,
      user_group_id,
      picture: req.file ? req.file.path.replace(/\\/g, "/") : "", // Save the file path if uploaded
    };
    console.log("That is a Data that are comming", data);
    // Create the new user in the database
    const createdNewUser = await User.creatingNewUser(data);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createdNewUser,
    });
  } catch (err) {
    // Check for duplicate key error
    if (err.code === "23505" && err.detail.includes("mobile")) {
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
exports.EditUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
  }

  try {
    // Fetch the existing user data
    const existingUser = await User.existingUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Merge existing data with the request body
    const data = { ...existingUser, ...req.body };

    // Handle profile picture update
    if (req.file) {
      data.picture = req.file.path.replace(/\\/g, "/"); // Normalize path for cross-platform compatibility
    } else {
      data.picture = existingUser.picture; // Retain the existing picture path
    }

    // Call model to update the user
    const updatedUser = await User.editUser(id, data);

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error while updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user.",
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

exports.getUserGroup = async (req, res) => {
  try {
    const userGroups = await User.getAllUserGroups();

    // Check if userGroups is an array and not empty
    if (userGroups.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user groups found",
      });
    }

    // Map over the userGroups array to send the appropriate response
    const responseData = userGroups.map((group) => ({
      intID: group.id,
      strGroupName: group.groupname,
      dtCreatedAt: group.created_at,
      dtUpdateAt: group.updated_at,
    }));

    res.status(200).json({
      success: true,
      message: "All user groups fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user groups",
      error: error.message,
    });
  }
};

exports.userGroupDelete = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteUserCount = await User.userGroupDelete(id);
    if (deleteUserCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No record found with that ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "User_group with ID " + id + " deleted successfully",
      data: id,
    });
  } catch (error) {
    console.error("Error while deleting the user group", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user group",
      error: error.message,
    });
  }
};
exports.getUser_groupById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.getUser_groupById(req.params.id);
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
//creating user
exports.createNewUser_group = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  const { groupname } = req.body;

  if (!groupname) {
    return res.status(400).json({
      success: false,
      message: "Missing required field: groupname",
    });
  }

  try {
    // Check if the group name already exists
    const existingGroup = await User.existingUsergroup(groupname);
    if (existingGroup) {
      return res.status(409).json({
        success: false,
        message: "Group with that name already exists.",
      });
    }

    // Prepare group data for insertion
    const data = {
      groupname, // Pass the correct field name
    };

    // Create the new group in the database
    const createdNewGroup = await User.creatingUser_group(data);

    return res.status(201).json({
      success: true,
      message: "User group created successfully.",
      data: createdNewGroup,
    });
  } catch (error) {
    console.error("Error creating user group:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the user group.",
      error: error.message,
    });
  }
};
//Edit userGroup

exports.updateUser = async (req, res) => {
  const { intGroupID } = req.params;
  console.log("That is intGroupID", intGroupID);

  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  try {
    // Fetch the existing user data based on the group ID
    const existingUser = await User.getUser_groupById(intGroupID);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User group not found.",
      });
    }

    // Check if the groupname is being updated
    const newGroupName = req.body.groupname || existingUser.groupname;

    // Check if the new groupname already exists (excluding the current record)
    const existingGroupnameCheck = await User.checkGroupnameExists(
      newGroupName,
      intGroupID
    );

    if (existingGroupnameCheck) {
      return res.status(400).json({
        success: false,
        message: `Group name "${newGroupName}" already exists.`,
      });
    }

    // If the groupname is valid and does not exist, proceed with the update
    const data = { ...existingUser, ...req.body };
    const updatedUser = await User.editUser_group(intGroupID, data);

    res.status(200).json({
      success: true,
      message: "User group data updated successfully",
      data: updatedUser,
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
