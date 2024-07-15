import { User } from "../../models/user/user.model.js";
import { frontError, catchError, successOk, validationError } from "../../utils/responses.js";
import { convertToLowercase, validateEmail, validatePhone } from '../../utils/utils.js';

// ========================= updateProfile ===========================

export async function updateProfile(req, res) {
    try {
        const userUid = req.user
        const user = await User.findOne({ where: { uuid: userUid } });
        if (!user) {
            return frontError(res, 'invalid uuid', 'uuid');
        }

        // If a profile image was uploaded, update profile_url in user table
        if (req.file) {
            const profileImagePath = req.file.path;
            user.profile_url = profileImagePath;
        }

        const reqData = convertToLowercase(req.body)
        const {
            email,
            firstName,
            lastName,
            dob,
            gender,
            phone,
        } = reqData;

        if (email) {
            const invalidEmail = validateEmail(email)
            if (invalidEmail) return validationError(res, invalidEmail)
            user.email = email;
        }
        if (firstName) {
            user.first_name = firstName;
        }
        if (lastName) {
            user.last_name = lastName;
        }
        if (dob) {
            user.dob = dob;
        }
        if (gender) {
            user.gender = gender;
        }
        if (phone) {
            const invalidPhone = validatePhone(phone)
            if (invalidPhone) return validationError(res, invalidPhone)
            user.phone = phone;
        }

        // Save updated user profile
        await user.save();

        return successOk(res, "User Profile Updated Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= deleteProfile ===========================

export async function deleteProfile(req, res) {
    try {
        const userUid = req.user
        const user = await User.findOne({ where: { uuid: userUid } });
        if (!user) {
            return frontError(res, 'invalid uuid', 'uuid');
        }
        await user.destroy()
        return successOk(res, "User Profile Deleted Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ====================================================================