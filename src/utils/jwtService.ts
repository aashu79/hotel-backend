// src/utils/jwtService.ts

import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWTPayload } from "../types/auth";

interface JWTServiceInterface {
  generateToken(payload: JWTPayload): string;
  verifyToken(token: string): JWTPayload;
}

class JWTService implements JWTServiceInterface {
  private secret: string;
  private expiresIn: string | number;

  constructor() {
    this.secret = process.env.JWT_SECRET || "default_secret";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as unknown as number | undefined, // ✅ Cast safely
    };

    return jwt.sign(payload, this.secret, options);
  }

  verifyToken(token: string): JWTPayload {
    const verifyOptions: VerifyOptions = {};
    return jwt.verify(token, this.secret, verifyOptions) as JWTPayload;
  }
}

export default new JWTService();
