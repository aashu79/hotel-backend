"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = __importDefault(require("twilio"));
class OTPService {
    constructor() {
        this.client = null;
        if (process.env.NODE_ENV === "production") {
            this.client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOTP(phoneNumber, otp) {
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
        }
        catch (error) {
            console.error("Twilio Error:", error);
            throw new Error("Failed to send OTP");
        }
    }
}
exports.default = new OTPService();
//# sourceMappingURL=otpService.js.map