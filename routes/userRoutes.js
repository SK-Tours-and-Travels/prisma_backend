const express = require("express");
const { registerUser, loginUser,listUsers } = require("../controllers/userController");
const {
  submitContactForm,
  getAllContacts,
  deleteContact,
} = require("../controllers/mailerController");
const {protect}  = require('../middlewares/auth')
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/list",protect,listUsers);

router.post("/sendmail", submitContactForm);
router.get("/contact", getAllContacts);
router.delete("/contact/delete/:id", deleteContact);
module.exports = router;
