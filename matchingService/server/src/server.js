import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const port = process.env.PORT || 5051;
const userServiceUrl = process.env.USER_SERVICE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!userServiceUrl) {
  throw new Error("USER_SERVICE_URL is not set in matchingService/server/.env");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set in matchingService/server/.env");
}

app.listen(port, () => {
  console.log(`Matching service server listening on http://localhost:${port}`);
});
