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
      console.log(`✅ OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    if (!this.client) {
      throw new Error("Twilio client not initialized");
    }

    try {
      await this.client.messages.create({
        body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      console.error("Twilio Error:", error);
      throw new Error("Failed to send OTP");
    }
  }
}

export default new OTPService();
