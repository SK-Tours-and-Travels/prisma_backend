const jwt = require("jsonwebtoken");
require("dotenv").config();
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
    const decoded = jwt.verify(token, process.env.KEY_SECRET);
    req.user = Number(decoded.userId);
    if (!req.user) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};
