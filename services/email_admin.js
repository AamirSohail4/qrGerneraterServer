const nodemailer = require("nodemailer");
const cron = require("node-cron");
const pool = require("../config/db");

class Event_Email {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "aamirweb93@gmail.com",
        pass: "hfgo ruqz nyyu jwdd",
      },
    });

    this.adminEmail = "aamirweb93@gmail.com";
  }

  async logEmail(eventId, participantId, participantEmail) {
    try {
      await pool.query(
        `INSERT INTO event_emails_logs (event_id, participant_id, participant_email)
         VALUES ($1, $2, $3)`,
        [eventId, participantId, participantEmail]
      );
      console.log(`Email log added for ${participantEmail}`);
    } catch (error) {
      console.error(
        `Error in logEmail for ${participantEmail}:`,
        error.message
      );
    }
  }

  async logCertificatePrint(eventId, participantId, userId) {
    try {
      await pool.query(
        `INSERT INTO event_certificate_print_logs (event_id, participant_id, user_id) 
         VALUES ($1, $2, $3)`,
        [eventId, participantId, userId]
      );
      console.log(
        `Certificate log added for Event ID: ${eventId}, Participant ID: ${participantId}, User ID: ${userId}`
      );
    } catch (error) {
      console.error("Failed to log certificate print:", error.message);
    }
  }

  // async emailCertificatesForExpiredEvents() {
  //   try {
  //     console.log("Fetching expired events...");

  //     const expiredEventsQuery = `
  //       SELECT
  //         e.id AS event_id,
  //         e.event_name,
  //         e.event_certificate_file_path,
  //         ep.id AS participant_id,
  //         ep.participant_name,
  //         ep.participant_email,
  //         ep.user_id
  //       FROM events e
  //       JOIN event_participants ep ON e.id = ep.event_id
  //       WHERE e.event_to_date < CURRENT_DATE AND e.is_active = 1
  //     `;

  //     const { rows: expiredEvents } = await pool.query(expiredEventsQuery);
  //     console.log("Expired Events:", expiredEvents);

  //     if (expiredEvents.length === 0) {
  //       console.log("No expired events found to send certificates.");
  //       return;
  //     }

  //     for (const event of expiredEvents) {
  //       console.log(
  //         `Preparing email for ${event.participant_email} with certificate at ${event.event_certificate_file_path}`
  //       );

  //       // Email for the participant
  //       const emailOptions = {
  //         from: '"Event Certificates" <aamirweb93@gmail.com>',
  //         to: event.participant_email,
  //         subject: `Your Certificate for ${event.event_name}`,
  //         text: `Dear ${event.participant_name},\n\nThank you for participating in ${event.event_name}. Please find your certificate attached.`,
  //         attachments: [
  //           {
  //             filename: "certificate.pdf",
  //             path: event.event_certificate_file_path,
  //           },
  //         ],
  //       };

  //       try {
  //         await this.transporter.sendMail(emailOptions);
  //         console.log(`Certificate sent to: ${event.participant_email}`);

  //         // Log the email and certificate print details
  //         await this.logEmail(
  //           event.event_id,
  //           event.participant_id,
  //           event.participant_email
  //         );
  //         await this.logCertificatePrint(
  //           event.event_id,
  //           event.participant_id,
  //           event.user_id
  //         );

  //         // Email summary to admin
  //         const emailOptionsAdmin = {
  //           from: '"Event Certificates" <aamirweb93@gmail.com>',
  //           to: this.adminEmail,
  //           subject: `Certificate Sent for ${event.event_name}`,
  //           text: `
  //             Dear Admin,

  //             A certificate has been successfully sent to the following participant:

  //             Participant Name: ${event.participant_name}
  //             Participant Email: ${event.participant_email}
  //             Event Name: ${event.event_name}
  //             Regards,
  //             Event Management System
  //           `,
  //         };

  //         await this.transporter.sendMail(emailOptionsAdmin);
  //         console.log(`Summary email sent to admin: ${this.adminEmail}`);
  //       } catch (emailError) {
  //         console.error(
  //           `Failed to send email to ${event.participant_email} or admin:`,
  //           emailError.message
  //         );
  //       }
  //     }

  //     console.log("All certificates emailed, logged, and admin notified.");
  //   } catch (error) {
  //     console.error("Error while processing expired events:", error.message);
  //   }
  // }
  async emailCertificatesForExpiredEvents() {
    try {
      console.log("Fetching expired events...");

      const expiredEventsQuery = `
        SELECT 
          e.id AS event_id,
          e.event_name,
          e.event_certificate_file_path,
          ep.id AS participant_id,
          ep.participant_name,
          ep.participant_email,
          ep.user_id
        FROM events e
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE e.event_to_date < CURRENT_DATE AND e.is_active = 1
      `;

      const { rows: expiredEvents } = await pool.query(expiredEventsQuery);
      console.log("Expired Events:", expiredEvents);

      if (expiredEvents.length === 0) {
        console.log("No expired events found to send certificates.");
        return;
      }

      for (const event of expiredEvents) {
        // Check if email has already been sent
        const emailCheckQuery = `
          SELECT 1 
          FROM event_emails_logs 
          WHERE event_id = $1 AND participant_id = $2
        `;
        const { rowCount: emailAlreadySent } = await pool.query(
          emailCheckQuery,
          [event.event_id, event.participant_id]
        );

        if (emailAlreadySent > 0) {
          console.log(
            `Email already sent for Participant ID: ${event.participant_id}, Event ID: ${event.event_id}`
          );
          continue; // Skip this participant
        }

        console.log(
          `Preparing email for ${event.participant_email} with certificate at ${event.event_certificate_file_path}`
        );

        // Email for the participant
        const emailOptions = {
          from: '"Event Certificates" <aamirweb93@gmail.com>',
          to: event.participant_email,
          subject: `Your Certificate for ${event.event_name}`,
          text: `Dear ${event.participant_name},\n\nThank you for participating in ${event.event_name}. Please find your certificate attached.`,
          attachments: [
            {
              filename: "certificate.pdf",
              path: event.event_certificate_file_path,
            },
          ],
        };

        try {
          await this.transporter.sendMail(emailOptions);
          console.log(`Certificate sent to: ${event.participant_email}`);

          // Log the email and certificate print details
          await this.logEmail(
            event.event_id,
            event.participant_id,
            event.participant_email
          );
          await this.logCertificatePrint(
            event.event_id,
            event.participant_id,
            event.user_id
          );

          // Email summary to admin
          const emailOptionsAdmin = {
            from: '"Event Certificates" <aamirweb93@gmail.com>',
            to: this.adminEmail,
            subject: `Certificate Sent for ${event.event_name}`,
            text: `
              Dear Admin,
  
              A certificate has been successfully sent to the following participant:
  
              Participant Name: ${event.participant_name}
              Participant Email: ${event.participant_email}
              Event Name: ${event.event_name}
              Event ID: ${event.event_id}
              Participant ID: ${event.participant_id}
              User ID: ${event.user_id}
  
              Regards,
              Event Management System
            `,
          };

          await this.transporter.sendMail(emailOptionsAdmin);
          console.log(`Summary email sent to admin: ${this.adminEmail}`);
        } catch (emailError) {
          console.error(
            `Failed to send email to ${event.participant_email} or admin:`,
            emailError.message
          );
        }
      }

      console.log("All certificates emailed, logged, and admin notified.");
    } catch (error) {
      console.error("Error while processing expired events:", error.message);
    }
  }

  scheduleEmailJob() {
    console.log("Scheduling the email job...");
    cron.schedule("* * * * *", async () => {
      console.log("Running certificate email job...");
      await this.emailCertificatesForExpiredEvents();
    });
  }
}

module.exports = Event_Email;
