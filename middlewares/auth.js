const jwt = require("jsonwebtoken");
require("dotenv").config();
const KEY_SECRET = process.env.KEY_SECRET;
exports.protect = (req, res, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies?.token ||
    req.query?.token;

  if (!token)
    return res
      .status(401)
      .json({ success: false, error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, KEY_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};
