const express = require("express");
const userController = require("../controllers/user.Controller");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Initialize Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const username = req.body.name || "user"; // Use "user" if name is not provided
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedUsername = username.replace(/\s+/g, "_"); // Replace spaces with underscores
    cb(
      null,
      `${sanitizedUsername}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

router.post(
  "/createNew",
  upload.single("picture"),
  userController.registerNewUser
);
router.patch("/edit/:id", upload.single("picture"), userController.EditUser);

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.post("/userLogin", upload.none(), userController.userLogin);
router.delete("/users/:id", userController.userDelete);

//For User Group
router.get("/user_group", userController.getUserGroup);
router.delete("/user_group/:id", userController.userGroupDelete);
router.get("/user_group/:id", userController.getUser_groupById);
router.post(
  "/add_user_group",
  upload.none(),
  userController.createNewUser_group
);

router.patch(
  "/edit_user_group/:intGroupID",
  upload.none(),
  userController.updateUser
);

module.exports = router;
