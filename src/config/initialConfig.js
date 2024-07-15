import dotenv from "dotenv";

dotenv.config();

console.log("hkajshdfkajshf============== Database url ============", process.env.DATABASE_URL)
console.log("hkajshdfkajshf============== Database url ============", process.env.DATABASE_NAME)
export const port = process.env.SERVER_PORT || 3034;
export const dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME || "postgresql://postgres:greenage@192.168.100.17:5432/project2";
export const jwtSecret = process.env.JWT_SECRET_KEY;
export const nodeEnv = process.env.NODE_ENVIRONMENT || 'development';