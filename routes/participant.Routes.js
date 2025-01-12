const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const participantController = require("../controllers/participant.Conttroller");
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
  "/addNew",
  upload.single("participant_picture_file_path"),
  participantController.createNewParticipant
);
// router.patch(
//   "/edit/:id",
//   upload.single("participant_picture_file_path"),
//   participantController.updateParticipant
// );
router.patch(
  "/edit/:id",
  upload.single("participant_picture_file_path"),
  (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    next();
  },
  participantController.updateParticipant
);

router.get("/getAll", participantController.getAllParticipant);
router.get("/getOne/:id", participantController.getParticipantById);
router.delete("/delete/:id", participantController.participantDelete);
// router.patch("/active_status/:id", participantController.active_status);
module.exports = router;
