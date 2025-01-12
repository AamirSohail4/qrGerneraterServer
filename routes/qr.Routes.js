const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const qrController = require("../controllers/qrCode.Controller");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/event");
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    } catch (err) {
      console.error("Error creating directory:", err);
      cb(new Error("Could not create directory"), dir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const uploadFiles = upload.fields([
  { name: "event_certificate_file_path", maxCount: 1 },
  { name: "event_banner_file_path", maxCount: 1 },
]);

router.post("/add_qrCode", upload.none(), qrController.createNewQrCodes);
router.patch("/edit/:id", uploadFiles, qrController.UpdateEvent);
router.get("/qr_codes", qrController.getAllQrCode);
router.get("/qrCodes/:id", qrController.getEvnentById);
router.delete("/delete/:id", qrController.qrCodeDelete);
// router.patch("/active_status/:id", qrController.active_status);
router.post("/set_key_value", upload.none(), qrController.createKeyValue);

// GET: Retrieve a key-value pair by key
router.get(
  "/get_key_value/:strKey",
  upload.none(),
  qrController.getKeyValueByKey
);

//validate route
router.get(
  "/validate_qrcode/:strCode",
  upload.none(),
  qrController.validateQRCode
);
//validate route
router.get("/get_scan_log/:strCode", qrController.getScanLogs);

//Get summary
router.get(
  "/get_summary/:strCode?/:dtFromDate?/:dtToDate?",
  qrController.getSummary
);
// router.get("/get_summary/:strCode", qrController.getSummary);
// router.get(
//   "/get_summary/:strCode/:dtFromDate/:dtToDate",
//   qrController.getSummary
// );

module.exports = router;
