import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const signToken = (payload) =>
  jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });

