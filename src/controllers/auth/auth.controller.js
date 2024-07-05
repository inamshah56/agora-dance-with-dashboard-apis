import jwt from "jsonwebtoken";
import User from "../../models/user/user.model.js";
import { jwtSecret } from "../../config/initialConfig.js";
import { hashPassword, comparePassword } from "../../utils/passwordUtils.js";

import { created, frontError, catchError, validationError, createdWithData, successOk } from "../../utils/responses.js";
import { convertToLowercase, validateEmail, validatePassword } from '../../utils/utils.js';
import { queryReqFields, bodyReqFields } from "../../utils/requiredFields.js"
import { Sequelize } from "sequelize";
import nodemailer from 'nodemailer';
import crypto from "crypto"

// ========================= nodemailer configuration ===========================

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    // Define email options
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Agora Dance - OTP Verification',
      text: `Your OTP for Agora Dance is ${otp}.`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true; // Return true if email sent successfully
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false; // Return false if email sending failed
  }
};

// ========================= registerUser ===========================

// Handles new user registration
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
    const reqData = convertToLowercase(req.body, ['password', 'confirmPassword'])
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

    console.log("=====================");
    console.log(password);
    console.log(confirmPassword);
    console.log("=====================");

    const invalidEmail = validateEmail(email)
    if (invalidEmail) return validationError(res, invalidEmail)

    const invalidPassword = validatePassword(password)
    if (invalidPassword) return validationError(res, invalidPassword)

    if (password !== confirmPassword) {
      throw new Error('Password confirmation does not match password');
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

    console.log(' ======= userData ======== ', userData);


    await User.create(userData)

    return created(res, "User created successfully")
  } catch (error) {
    console.log(error)
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

    // generating otp 
    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + 60);

    // implement sending mail logic here
    const emailSent = await sendOTPEmail(email, otp);
    if (emailSent) {
      const otpData = {
        otp,
        expiry,
        otp_count: Sequelize.literal('otp_count + 1')
      }
      // Save OTP in the database
      await User.update(otpData, {
        where: { email },
      });
      console.log('OTP sent successfully.');
      return successOk(res, "OTP sent successfully")
    } else {
      // Handle failure to send email
      console.log('Failed to send OTP.');
    }
  } catch (error) {
    // Handle any errors that occur during the registration process
    catchError(res, error);
  }
}

// configure gmail to send otp --pending


// // Compare the provided password with the stored hashed password using the comparePassword function
// const isMatch = await comparePassword(password, user.password);
// if (!isMatch) {
//   return validationError(res, "Invalid Credentials")
// }

// // Create a JWT payload and generate a token
// const payload = { userId: user._id };
// const token = jwt.sign(payload, jwtSecret, {
//   expiresIn: "1h",
// });
// // Respond with the generated token
// res.json({ token });