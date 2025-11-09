import { logger } from "./logger";
import twilio from "twilio";
import { Request, Response } from "express";

interface OTPServiceInterface {
  generateOTP(): string;
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
}

class OTPService implements OTPServiceInterface {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    if (process.env.NODE_ENV === "development") {
      logger.info(`✅ OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    if (!this.client) {
      throw new Error("Twilio client not initialized");
    }
    try {
      // await this.client.messages.create({
      //   body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber,
      // });
      await this.client.verify.v2
        .services(process.env.TWILO_SERVICE_SID || "")
        .verifications.create({ to: phoneNumber, channel: "sms" });
      return true;
    } catch (error) {
      logger.error("Twilio Error:", error);
      throw new Error("Failed to send OTP");
    }
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    if (process.env.NODE_ENV === "development") {
      logger.info(`✅ Verifying OTP for ${phoneNumber}: ${code}`);
      return true;
    }
    if (!this.client) {
      throw new Error("Twilio client not initialized");
    }
    try {
      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILO_SERVICE_SID || "")
        .verificationChecks.create({ to: phoneNumber, code: code });
      return verificationCheck.status === "approved";
    } catch (error) {
      logger.error("Twilio Error:", error);
      throw new Error("Failed to verify OTP");
    }
  }
}

export default new OTPService();
