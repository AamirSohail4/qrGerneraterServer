const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
// const Event_Email = require("./services/email_admin");
const userRoutes = require("./routes/user.Routes");
const qrRoutes = require("./routes/qr.Routes");
const participantRoutes = require("./routes/participant.Routes");
const emailRoutes = require("./routes/event_emails_logs.Routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;
// const eventEmailService = new Event_Email();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the 'uploads' folder
app.use("/uploads", express.static("uploads"));
// Import Routes
app.use("/api/users", userRoutes);
app.use("/api/codes", qrRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    error: err.message,
  });
});
// app.listen(5001, "0.0.0.0", () => {
//   console.log("Server is running on port 5001");
// });

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);

  // Start the scheduled email job
  // eventEmailService.scheduleEmailJob();

  // Test manually (optional)
  // eventEmailService.emailCertificatesForExpiredEvents();
});
