const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const event_emails_logsController = require("../controllers/event_emails_logs.Controller");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/participant");
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
        cb(new Error("Could not create directory"));
      } else {
        cb(null, dir);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  "/addNew/email_log",
  upload.none(),
  event_emails_logsController.createdNewEmail_logs
);
router.get("/getAll", event_emails_logsController.getAllevent_emails_logs);
router.post(
  "/addNew/certificatePrinting",
  upload.none(),
  event_emails_logsController.createdCertificatePrinting
);
router.get(
  "/getReport",
  event_emails_logsController.generateEventParticipantsReport
);
router.get(
  "/geteventSumary",
  event_emails_logsController.getEventSummaryReport
);
router.post("/sendEmail", event_emails_logsController.sendEmail);
module.exports = router;
