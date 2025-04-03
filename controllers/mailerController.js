const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");
require("dotenv").config();

const HOST = process.env.MAILTRAP_HOST;
const PORT = process.env.MAILTRAP_PORT;
const USER = process.env.USERNAME;
const PASS = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  auth: {
    user: "deepakavadhani.locateus@gmail.com",
    pass: "mswwiemjpsgsyydt",
  },
});

const sendContactEmail = async (name, email, phone, message) => {
  try {
    const mailOptions = {
      from: email,
      to: "deepakavadhani.locateus@gmail.com",
      subject: "New Contact Form Submission",
      text: `You received a new message from ${name}.\n\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

const submitContactForm = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const contact = await prisma.contact.create({
      data: { name, email, phone, message },
    });

    const emailResponse = await sendContactEmail(name, email, phone, message);

    res.json({
      success: true,
      message: "Contact form submitted successfully",
      emailStatus: emailResponse,
      data: contact,
    });
  } catch (error) {
    console.error("Error handling contact form:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
    });
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    await prisma.contact.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { submitContactForm, getAllContacts, deleteContact };
