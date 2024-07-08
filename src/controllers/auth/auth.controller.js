import crypto from "crypto"
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import { Sequelize } from "sequelize";
import User from "../../models/user/user.model.js";
import { bodyReqFields } from "../../utils/requiredFields.js"
import { convertToLowercase, validateEmail, validatePassword } from '../../utils/utils.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwtTokenGenerator.js"
import {
  created,
  frontError,
  catchError,
  validationError,
  successOk,
  successOkWithData,
  UnauthorizedError
} from "../../utils/responses.js";

// ========================= nodemailer configuration ===========================

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'agoradance.app@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: 'agoradance.app@gmail.com',
      to: email,
      subject: 'Agora Dance - OTP Verification',
      text: `Your OTP for Agora Dance is ${otp}.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true; // Return true if email sent successfully
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false; // Return false if email sending failed
  }
};

// ========================= registerUser ===========================

export async function registerUser(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, [
      "firstName",
      "lastName",
      "age",
      "gender",
      "email",
      "password",
      "confirmPassword",
      "fcmToken",
    ]);
    const reqData = convertToLowercase(req.body, ['password', 'confirmPassword', 'email'])
    const {
      firstName, lastName, age, gender, email, password, confirmPassword, fcmToken
    } = reqData;

    if (reqBodyFields.error) return reqBodyFields.resData;

    // Check if a user with the given email already exists
    let user = await User.findOne({
      where: {
        email: email
      }
    });

    if (user) return validationError(res, "", "User already exists");

    const invalidEmail = validateEmail(email)
    if (invalidEmail) return validationError(res, invalidEmail)

    const invalidPassword = validatePassword(password)
    if (invalidPassword) return validationError(res, invalidPassword)

    if (password !== confirmPassword) {
      throw new Error('Password and Confirm Password do not match.');
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      age,
      gender,
      email,
      password,
      fcm_token: fcmToken
    }

    await User.create(userData)

    return created(res, "User created successfully")
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      const errorMessage = error.errors[0].message;
      const key = error.errors[0].path
      validationError(res, key, errorMessage);
    } else {
      catchError(res, error);
    }
  }
}

// ========================= loginUser ===========================

// Handles user login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email) return frontError(res, "this is required", "email")
    if (!password) return frontError(res, "this is required", "password")

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return validationError(res, "user not found")
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return validationError(res, "Invalid credentials");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // If passwords match, return success
    return successOkWithData(res, "Login successful", { accessToken, refreshToken });
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= regenerateAccessToken ===========================

export async function regenerateAccessToken(req, res) {
  try {

    const { refreshToken } = req.body;
    if (!refreshToken) frontError(res, "this is required", "refreshToken")

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return validationError(res, "Invalid refresh token");
    }

    const newAccessToken = generateAccessToken({ uuid: decoded.userUid });

    return successOkWithData(res, "Access Token Generated Successfully", { accessToken: newAccessToken });
  } catch (error) {
    catchError(res, error);
  }
};

// ========================= updatePassword ===========================

// API endpoint to set new password after OTP verification
export async function updatePassword(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["oldPassword", "newPassword", "confirmPassword", "email"]);
    if (reqBodyFields.error) return reqBodyFields.resData;

    const { oldPassword, newPassword, confirmPassword, email } = req.body;

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return validationError(res, "user not found")
    }

    // Compare oldPassword with hashed password in database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return validationError(res, 'Invalid old password', "oldPassword");
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return validationError(res, "Password and Confirm Password do not match.");
    }

    // Check if oldPassword and newPassword are the same
    if (oldPassword === newPassword) {
      return validationError(res, 'New password must be different from old password');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // // Update user's password in the database
    await User.update({ password: hashedPassword }, {
      where: { email }
    });

    return successOk(res, "Password updated successfully.");
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= forgotPassword ===========================

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return frontError(res, "this is required", "email")

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return validationError(res, "user not found")
    }

    // generating otp 
    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + 60);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      const otpData = {
        otp,
        expiry,
        otp_count: 0
      }
      // Save OTP in the database
      await User.update(otpData, {
        where: { email },
      });
      req.user = { email }
      return successOk(res, "OTP sent successfully")
    } else {
      return catchError(res, "Something went wrong. Failed to send OTP.")
    }
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= verifyOtp ===========================

// Handles verify otp
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email) return frontError(res, "this is required", "email")
    if (!otp) return frontError(res, "this is required", "otp")

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return validationError(res, "user not found")
    }

    if (user.otp_count >= 3) {
      return validationError(res, "Maximum OTP attempts reached. Please regenerate OTP.");
    }

    // Compare OTP if does'nt match increment otp_count
    if (user.otp !== parseInt(otp, 10)) {
      await User.update(
        {
          otp_count: Sequelize.literal('otp_count + 1'),
        },
        { where: { email } },
      );
      return validationError(res, 'Invalid OTP');
    }

    // OTP matched, set can_change_password to true
    await User.update(
      { can_change_password: true },
      { where: { email } }
    );

    return successOk(res, "OTP Verified Successfully");
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= setNewPassword ===========================

// API endpoint to set new password after OTP verification
export async function setNewPassword(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["newPassword", "confirmPassword", "email"]);
    if (reqBodyFields.error) return reqBodyFields.resData;

    const { newPassword, confirmPassword, email } = req.body;

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return validationError(res, "user not found")
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return validationError(res, "Password and Confirm Password do not match.");
    }

    // only allow if can_change_password is true , i.e otp verified
    if (user.can_change_password === false) {
      return UnauthorizedError(res, "Unauthorized");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in the database
    await User.update({ password: hashedPassword, can_change_password: false }, {
      where: { email }
    });

    return successOk(res, "Password updated successfully.");
  } catch (error) {
    catchError(res, error);
  }
}

// ===================================================================