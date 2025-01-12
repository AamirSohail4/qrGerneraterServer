const QRCode = require("../models/qrCode.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "eeeafbfdss";
const { response } = require("express");
const pool = require("../config/db");

//For Login

exports.getAllQrCode = async (req, res) => {
  try {
    const qrCodes = await QRCode.getAllQRCode();
    res.status(200).json({
      success: true,
      message: "success",
      data: qrCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.createNewQrCodes = async (req, res) => {
  const { strCode, remarks } = req.body;

  if (!Array.isArray(strCode) || strCode.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing required field: strCode (should be an array)",
    });
  }

  try {
    // Pass the data to the model's function
    const createdNewCodes = await QRCode.createQrCodes(strCode, remarks);

    const responseData = createdNewCodes.map((createdNewCounter) => ({
      intID: createdNewCounter.id,
      strCode: createdNewCounter.code,
      strRemarks: createdNewCounter.remarks,
      dtCreated_at: createdNewCounter.created_at,
      dtLast_scanned_at: createdNewCounter.last_scanned_at,
      intScan_count: createdNewCounter.scan_count,
    }));

    // Return the newly created QR codes in the response
    return res.status(201).json({
      success: true,
      message: "Success",
      data: responseData,
    });
  } catch (error) {
    console.error("Error during QR code creation:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating QR codes",
      error: error.message,
    });
  }
};

exports.getEvnentById = async (req, res) => {
  const id = req.params.id;
  console.log("Received ID:", id); // Debug log
  try {
    const result = await Admin.geteventById(id);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Event against the id not found",
        data: id,
      });
    }
    res.status(200).json({
      success: true,
      message: "Event Found Successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getEvnentById:", error.message);
    res.status(500).json({
      success: false,
      message: "Event not Found",
      error: error.message,
    });
  }
};

//3 Delete User Id
exports.qrCodeDelete = async (req, res) => {
  const id = req.params.id;

  try {
    const deleteAdminCount = await QRCode.QRCodeDelete(id);
    if (deleteAdminCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No record found with that ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "QR Code with ID " + id + " deleted successfully",
      data: id,
    });
  } catch (error) {
    console.error("Error while deleting the user", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete QR Code ",
      error: error.message,
    });
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

//For Update Event

exports.UpdateEvent = async (req, res) => {
  const { id } = req.params;
  console.log("That is an id", id);
  const user_id = 2;

  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  try {
    const existingEvent = await Admin.geteventById(id);
    console.log("That is an existingEvent", existingEvent);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Handle file uploads (only replace paths if a new file is uploaded)
    const event_certificate_file_path = req.files["event_certificate_file_path"]
      ? `uploads/event/${req.files["event_certificate_file_path"][0].filename}`
      : existingEvent.event_certificate_file_path;

    const event_banner_file_path = req.files["event_banner_file_path"]
      ? `uploads/event/${req.files["event_banner_file_path"][0].filename}`
      : existingEvent.event_banner_file_path;

    const updateValues = {
      event_name:
        req.body.event_name !== undefined
          ? req.body.event_name
          : existingEvent.event_name,
      event_from_date:
        req.body.event_from_date !== undefined
          ? req.body.event_from_date
          : existingEvent.event_from_date,
      event_to_date:
        req.body.event_to_date !== undefined
          ? req.body.event_to_date
          : existingEvent.event_to_date,
      event_location:
        req.body.event_location !== undefined
          ? req.body.event_location
          : existingEvent.event_location,
      is_active:
        req.body.is_active !== undefined
          ? req.body.is_active
          : existingEvent.is_active,
      event_certificate_file_path,
      event_banner_file_path,
    };

    // Update event with the new values
    const updatedEvent = await Admin.updateEvent(updateValues, id, user_id);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error while updating event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update event due to server error.",
      error: error.message, // Optionally include for debugging
    });
  }
};

// For Validate Token
exports.createKeyValue = async (req, res) => {
  const { strType, strKey, strValue } = req.body;

  // Validate the request body
  if (!strType || !strKey || !strValue) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: strType, strKey, or strValue",
    });
  }

  try {
    // Create a new key-value pair
    const newKeyValue = await QRCode.createKeyValue({
      strType,
      strKey,
      strValue,
    });
    const responseData = {
      intID: newKeyValue.id,
      strType: newKeyValue.type,
      strKey: newKeyValue.key,
      strValue: newKeyValue.value,
      dtCreated_at: newKeyValue.created_at,
      dtUpdated_at_at: newKeyValue.updated_at,
    };
    return res.status(201).json({
      success: true,
      message: "success",
      data: responseData,
    });
  } catch (error) {
    console.error("Error during key-value creation:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating key-value pair",
      error: error.message,
    });
  }
};

// GET: Get key-value pair by key
exports.getKeyValueByKey = async (req, res) => {
  const { strKey } = req.params;

  try {
    // Retrieve the key-value pair by key
    const keyValue = await QRCode.getKeyValueByKey(strKey);

    if (!keyValue) {
      return res.status(404).json({
        success: false,
        message: "Key not found",
      });
    }
    const responseData = {
      intID: keyValue.id,
      strType: keyValue.type,
      strKey: keyValue.key,
      strValue: keyValue.value,
      dtCreated_at: keyValue.created_at,
      dtUpdated_at_at: keyValue.updated_at,
    };
    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error during key-value retrieval:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving key-value pair",
      error: error.message,
    });
  }
};
//Validate Query
exports.validateQRCode = async (req, res) => {
  const { strCode } = req.params;
  console.log("That is a strCode", strCode);

  try {
    // Check if the code exists in the database
    const qrCode = await pool.query("SELECT * FROM qr_codes WHERE code = $1", [
      strCode,
    ]);

    if (!qrCode.rows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code.",
      });
    }

    const { id, scan_count, last_scanned_at } = qrCode.rows[0];

    // // Check if the code has reached its maximum allowed scans
    // const maxScans = await pool.query(
    //   "SELECT value FROM key_values WHERE key = $1",
    //   ["max_scans"]
    // );
    // if (scan_count >= parseInt(maxScans.rows[0].value)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "QR code has already reached the maximum allowed scans.",
    //   });
    // }

    // Update the QR code's scan count and last scanned timestamp
    await pool.query(
      "UPDATE qr_codes SET scan_count = scan_count + 1, last_scanned_at = CURRENT_TIMESTAMP WHERE code = $1",
      [strCode]
    );

    // Insert a scan log
    await pool.query(
      "INSERT INTO scan_logs (code, scanned_at) VALUES ($1, CURRENT_TIMESTAMP)",
      [strCode]
    );

    // Respond with success and updated scan details
    return res.status(200).json({
      success: true,
      message: "QR code is valid.",
      data: {
        strCode: strCode,
        intScan_Count: scan_count + 1,
        dtLast_Scanned_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error validating QR code:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while validating the QR code.",
    });
  }
};
//get Scan Logs By id
exports.getScanLogs = async (req, res) => {
  const { strCode } = req.params;

  try {
    // Retrieve scan logs from the model
    const result = await QRCode.getScanLog(strCode);

    // Check if logs are found
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No scan logs found for the code: ${strCode}`,
        data: strCode,
      });
    }

    // Map the result to the desired response format
    const responseData = result.map((log) => ({
      intID: log.id,
      strCode: log.code,
      dtscanned_at: log.scanned_at,
    }));

    // Respond with the logs
    res.status(200).json({
      success: true,
      message: "Scan logs retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in Scan Logs:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving scan logs",
      error: error.message,
    });
  }
};
//Get Summary
// exports.getSummary = async (req, res) => {
//   const { strCode, dtFromDate, dtToDate } = req.query;

//   if (!strCode || !dtFromDate || !dtToDate) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Missing required query parameters: strCode, dtFromDate, dtToDate",
//     });
//   }

//   try {
//     const summary = await QRCode.getSummary(strCode, dtFromDate, dtToDate);
//     res.status(200).json({
//       success: true,
//       message: "QR Code summary fetched successfully",
//       data: summary,
//     });
//   } catch (error) {
//     console.error("Error fetching QR Code summary:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching QR Code summary",
//       error: error.message,
//     });
//   }
// };
// exports.getSummary = async (req, res) => {
//   const { strCode } = req.params;
//   const { dtFromDate, dtToDate } = req.query;

//   if (!strCode) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required parameter: strCode",
//     });
//   }

//   try {
//     const summary = await QRCode.getSummary(strCode, dtFromDate, dtToDate);
//     res.status(200).json({
//       success: true,
//       message: "QR Code summary fetched successfully",
//       data: summary,
//     });
//   } catch (error) {
//     console.error("Error fetching QR Code summary:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching QR Code summary",
//       error: error.message,
//     });
//   }
// };

exports.getSummary = async (req, res) => {
  const { strCode, dtFromDate, dtToDate } = req.params;

  try {
    const summary = await QRCode.getSummary(strCode, dtFromDate, dtToDate);
    res.status(200).json({
      success: true,
      message: "QR Code summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching QR Code summary:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching QR Code summary",
      error: error.message,
    });
  }
};
