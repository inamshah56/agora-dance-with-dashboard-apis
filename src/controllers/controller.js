import { successResponse } from "../utils/responses.js";

// test controller
export async function test(req, res) {
    const { name } = req.body;

    try {
        const data = {
            name: name
        }
        successResponse(res, `Welcome ${name} to Agora Dance!!!`, data)
    } catch (error) {
        // Handle any errors that occur during the registration process
        res.status(500).json({ message: "Server Error" });
    }
}