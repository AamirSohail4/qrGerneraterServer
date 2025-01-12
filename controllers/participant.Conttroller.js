const Admin = require("../models/participant.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Participant = require("../models/participant.Model");
const secretKey = "eeeafbfdss";

//For Login

exports.getAllParticipant = async (req, res) => {
  try {
    const eventes = await Admin.getAllParticipant();
    res.status(200).json({
      success: true,
      message: "All Eventes fetch  successfully",
      data: eventes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "All Eventes fetch  successfully",
      error: error.message,
    });
  }
};
//2 Get Single User Id
exports.getParticipantById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Admin.getParticipantById(id);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Participant against the id not found",
        data: id,
      });
    }
    res.status(200).json({
      success: true,
      message: "Participant Found Successfuly",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Participant not Found",
      error: error.message,
    });
  }
};

//3 Delete User Id
exports.participantDelete = async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt to delete participant
    const deleteResult = await Participant.participantDelete(id);

    if (!deleteResult) {
      // If no record was found to delete
      return res.status(404).json({
        success: false,
        message: `No participant found with ID: ${id}`,
      });
    }

    // Respond with success
    res.status(200).json({
      success: true,
      message: `Participant with ID: ${id} deleted successfully`,
    });
  } catch (error) {
    // Log and return error message if something goes wrong
    console.error("Error while deleting participant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete participant",
      error: error.message,
    });
  }
};

exports.createNewParticipant = async (req, res) => {
  const {
    participant_name,
    participant_phone_number,
    participant_email,
    participant_remarks,
    registration_date,
    event_id,
  } = req.body;

  console.log("Received event data:", req.body);

  const user_id = 2;

  if (
    !participant_name ||
    !participant_phone_number ||
    !participant_email ||
    !event_id
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Participant name, phone number, email, and event ID are required.",
    });
  }

  try {
    const participant_picture_file_path = req.file
      ? `uploads/participant/${req.file.filename}`
      : null;

    const data = {
      registration_date,
      participant_name,
      participant_phone_number,
      participant_email,
      participant_remarks: participant_remarks || null,
      event_id,
      participant_picture_file_path,
    };

    const createdNewParticipant = await Participant.creatingParticipant(
      data,
      user_id
    );

    return res.status(201).json({
      success: true,
      message: "Participant created successfully.",
      data: createdNewParticipant,
    });
  } catch (error) {
    console.error("Error while creating participant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create participant due to server error.",
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

//For Update Participant

exports.updateParticipant = async (req, res) => {
  const { id } = req.params;

  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing.",
    });
  }

  try {
    // Fetch the existing participant
    const existingParticipant = await Participant.getParticipantById(id);
    console.log("That is an existingParticipant", existingParticipant);

    if (!existingParticipant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found.",
      });
    }

    const participant_picture_file_path = req.file
      ? `uploads/participant/${req.file.filename}`
      : existingParticipant.participant_picture_file_path;

    // Prepare updated values
    // const updateValues = {
    //   event_id:
    //     req.body.event_id !== undefined
    //       ? req.body.event_id
    //       : existingParticipant.event_id,
    //   user_id:
    //     req.body.user_id !== undefined
    //       ? req.body.user_id
    //       : existingParticipant.user_id,
    //   registration_date:
    //     req.body.registration_date !== undefined
    //       ? req.body.registration_date
    //       : existingParticipant.registration_date,
    //   participant_name:
    //     req.body.participant_name !== undefined
    //       ? req.body.participant_name
    //       : existingParticipant.participant_name,
    //   participant_phone_number:
    //     req.body.participant_phone_number !== undefined
    //       ? req.body.participant_phone_number
    //       : existingParticipant.participant_phone_number,
    //   participant_email:
    //     req.body.participant_email !== undefined
    //       ? req.body.participant_email
    //       : existingParticipant.participant_email,

    //   participant_remarks:
    //     req.body.participant_remarks !== undefined
    //       ? req.body.participant_remarks
    //       : existingParticipant.participant_remarks,
    // };
    const updateValues = {
      event_id:
        req.body.event_id !== undefined
          ? req.body.event_id
          : existingParticipant.event_id,
      user_id:
        req.body.user_id !== undefined
          ? req.body.user_id
          : existingParticipant.user_id,
      registration_date:
        req.body.registration_date !== undefined
          ? req.body.registration_date
          : existingParticipant.registration_date,
      participant_name:
        req.body.participant_name !== undefined
          ? req.body.participant_name
          : existingParticipant.participant_name,
      participant_phone_number:
        req.body.participant_phone_number !== undefined
          ? req.body.participant_phone_number
          : existingParticipant.participant_phone_number,
      participant_email:
        req.body.participant_email !== undefined
          ? req.body.participant_email
          : existingParticipant.participant_email,
      participant_picture_file_path, // Include this line
      participant_remarks:
        req.body.participant_remarks !== undefined
          ? req.body.participant_remarks
          : existingParticipant.participant_remarks,
    };
    // Update participant with the new values
    const updatedParticipant = await Participant.updateParticipant(
      updateValues,
      id
    );

    return res.status(200).json({
      success: true,
      message: "Participant updated successfully.",
      data: updatedParticipant,
    });
  } catch (error) {
    console.error("Error while updating participant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update participant due to server error.",
      error: error.message, // Optionally include for debugging
    });
  }
};

// For Validate Token
