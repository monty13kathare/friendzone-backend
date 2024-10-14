const User = require("../models/User");
const jwt = require("jsonwebtoken");

// exports.isAuthenticated = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer")) {
//     const message = "Unauthenticated No Bearer";
//     return res.status(401).json({message:message});
//   }

//   const token = authHeader.split(" ")[1];
//   console.log('token', token)
//   try {
//     const payload = await jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({
//       _id: payload._id,
//       // isVerified: true,
//     });
  
//     if (!user) {
//       return res.status(401).json({success:false,message:"Invalid JWT"})
//     }

//     if (user && user.changePasswordAfter(payload.iat)) {
//       return res.status(401).json({success:false,message:"User recently changed the password, Please login again"})
//     } else if (user) {
//       req.user = { _id: payload._id, details: user };
//     }
//     next();
//   } catch (error) {
//     let message;
//     let err;
//     if (error instanceof jwt.TokenExpiredError) {
//       message = "Token Expired";
//     } else {
//       message = "Authentication failed invalid JWT";
//     }

   
//   }
// };


exports.isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ success: false, message: "Unauthenticated. No Bearer token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET); // Verifies the JWT
    const user = await User.findOne({ _id: payload._id });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid JWT, user not found." });
    }

    req.user = user
    next();

  } catch (error) {
    let message;

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired. Please log in again.";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Authentication failed. Invalid JWT.";
    } else {
      message = "Authentication failed. Please try again.";
    }

    return res.status(401).json({ success: false, message });
  }
};