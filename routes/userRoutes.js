const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const {
  submitContactForm,
  getAllContacts,
  deleteContact,
} = require("../controllers/mailerController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/sendmail", submitContactForm);
router.get("/contact", getAllContacts);
router.delete("/contact/delete/:id", deleteContact);
module.exports = router;
