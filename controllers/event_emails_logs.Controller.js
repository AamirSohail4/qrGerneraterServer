const Admin = require("../models/participant.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Event_Email = require("../models/event_emails_logs.Model");
const secretKey = "eeeafbfdss";
const nodemailer = require("nodemailer");
const path = require("path");
const multer = require("multer");

const upload = multer({ dest: "./uploads" });
exports.sendEmail = [
  upload.single("pdf"), // Middleware to handle the uploaded PDF
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { participant_email, participant_name, event_name } = req.body;
    const pdfPath = req.file?.path; // Uploaded PDF file path

    if (!pdfPath) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "aamirweb93@gmail.com",
        pass: "hfgo ruqz nyyu jwdd", // Use your app-specific password
      },
    });

    const mailOptions = {
      from: '"Event Organizer" <aamirweb93@gmail.com>',
      to: participant_email,
      subject: `Your Certificate for ${event_name}`,
      text: `Dear ${participant_name},\n\nThank you for participating in ${event_name}. Please find your certificate attached.\n\nBest Regards,\nEvent Team`,
      attachments: [
        {
          filename: `${participant_name}-Certificate.pdf`,
          path: pdfPath, // Path to the uploaded PDF file
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email.", error });
    } finally {
      // Optionally delete the file after sending the email
      const fs = require("fs");
      fs.unlink(pdfPath, (err) => {
        if (err) console.error("Error deleting PDF file:", err);
      });
    }
  },
];

//For etAllevent_emails_logs

exports.getAllevent_emails_logs = async (req, res) => {
  try {
    const eventes = await Event_Email.getAllevent_emails_logs();
    res.status(200).json({
      success: true,
      message: "All event logs fetch  successfully",
      data: eventes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "All Eventes loges fetch  successfully",
      error: error.message,
    });
  }
};

exports.createdNewEmail_logs = async (req, res) => {
  const { event_id, participant_id, participant_email } = req.body;

  // Validate request data
  if (!event_id || !participant_id || !participant_email) {
    return res.status(400).json({
      success: false,
      message: "Event ID, Participant ID, and Participant Email are required.",
    });
  }

  try {
    const data = { event_id, participant_id, participant_email };

    // Create new event email log
    const createdNewEmailLogs = await Event_Email.creatingEmailLogs(data);

    return res.status(201).json({
      success: true,
      message: "Event email log created successfully.",
      data: createdNewEmailLogs,
    });
  } catch (error) {
    console.error("Error while creating event email log:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event email log due to server error.",
      error: error.message,
    });
  }
};

// // Updating End Point
exports.createdCertificatePrinting = async (req, res) => {
  const { event_id, participant_id, user_id } = req.body;

  // Validate request data
  if (!event_id || !participant_id || !user_id) {
    return res.status(400).json({
      success: false,
      message: "Event ID, Participant ID, and User ID are required.",
    });
  }

  try {
    const data = { event_id, participant_id, user_id };

    // Create new event certificate printing log
    const createdNewCertificateLog =
      await Event_Email.CreatecertificatePrinting(data);

    return res.status(201).json({
      success: true,
      message: "Event certificate printing log created successfully.",
      data: createdNewCertificateLog,
    });
  } catch (error) {
    console.error(
      "Error while creating event certificate printing log:",
      error
    );
    return res.status(500).json({
      success: false,
      message:
        "Failed to create event certificate printing log due to server error.",
      error: error.message,
    });
  }
};
//Report Sectiton
exports.generateEventParticipantsReport = async (req, res) => {
  const {
    event_name,
    participant_name,
    mobile_number,
    email,
    from_date,
    to_date,
  } = req.query;

  // Validate that required filters are correct (you can add more validations as needed)
  try {
    const filters = {
      event_name,
      participant_name,
      mobile_number,
      email,
      from_date,
      to_date,
    };

    // Call the model function to get the data
    const reportData = await Event_Email.getEventParticipantsReport(filters);

    return res.status(200).json({
      success: true,
      message: "Event participants report generated successfully.",
      data: reportData, // Return the report data
    });
  } catch (error) {
    console.error("Error while generating event participants report:", error);
    return res.status(500).json({
      success: false,
      message:
        "Failed to generate the event participants report due to server error.",
      error: error.message,
    });
  }
};
//For Event Sumary
exports.getEventSummaryReport = async (req, res) => {
  try {
    const { event_name, from_date, to_date } = req.query;

    const data = await Event_Email.getEventSummary({
      event_name,
      from_date,
      to_date,
    });

    // Send response
    return res.status(200).json({
      success: true,
      message: "Event summary report generated successfully.",
      data,
    });
  } catch (error) {
    console.error("Error generating event summary report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate event summary report.",
      error: error.message,
    });
  }
};
