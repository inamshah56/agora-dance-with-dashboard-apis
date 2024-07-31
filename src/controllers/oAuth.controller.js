import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, } from "../utils/jwtTokenGenerator.js";
import { successOkWithData, frontError, validationError, catchError } from "../utils/responses.js";


export async function googleCallback(req, res) {
    try {
        const { email, family_name, given_name } = req.user;
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
            user = await User.create({
                first_name: given_name,
                last_name: family_name,
                email: email,
                password: "AB#123897",
            });

        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return successOkWithData(res, "Login successful", { accessToken, refreshToken });

    } catch (error) {
        catchError(res, error);
    }
}