const jwt = require("jsonwebtoken");
require("dotenv").config();
const key_secret = process.env.key_secret;
exports.protect = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, key_secret);
    req.user = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
