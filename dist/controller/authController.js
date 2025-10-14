"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const otpService_1 = __importDefault(require("../utils/otpService"));
const otpStore_1 = __importDefault(require("../utils/otpStore"));
const jwtService_1 = __importDefault(require("../utils/jwtService"));
const prisma = new client_1.PrismaClient();
class AuthController {
    async sendOTPForRegistration(req, res) {
        try {
            const { name, phoneNumber } = req.body;
            if (!phoneNumber) {
                res.status(400).json({
                    success: false,
                    message: "Phone number is required for customer registration",
                });
                return;
            }
            const existingUser = await prisma.user.findUnique({
                where: { phoneNumber: BigInt(phoneNumber) },
            });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "Phone number already registered",
                });
                return;
            }
            const otp = otpService_1.default.generateOTP();
            await otpService_1.default.sendOTP(phoneNumber, otp);
            otpStore_1.default.setOTP(phoneNumber, otp, { name, phoneNumber });
            res.json({
                success: true,
                message: "OTP sent successfully",
            });
        }
        catch (error) {
            console.error("Send OTP Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send OTP",
            });
        }
    }
    async verifyOTPAndRegister(req, res) {
        try {
            const { identifier, otp } = req.body;
            const record = otpStore_1.default.getOTP(identifier);
            if (!record || !record.userData) {
                res.status(400).json({
                    success: false,
                    message: "Invalid or expired OTP",
                });
                return;
            }
            if (record.otp !== otp) {
                res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                });
                return;
            }
            const user = await prisma.user.create({
                data: {
                    name: record.userData.name,
                    phoneNumber: BigInt(record.userData.phoneNumber),
                    role: "CUSTOMER",
                },
                select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    role: true,
                },
            });
            otpStore_1.default.clearOTP(identifier);
            const token = jwtService_1.default.generateToken({
                id: user.id,
                role: user.role,
            });
            const userForResponse = {
                ...user,
                phoneNumber: user.phoneNumber !== undefined && user.phoneNumber !== null
                    ? user.phoneNumber.toString()
                    : user.phoneNumber,
            };
            res.status(201).json({
                success: true,
                message: "Registration successful",
                token,
                user: userForResponse,
            });
        }
        catch (error) {
            console.error("Verify OTP Error:", error);
            res.status(500).json({
                success: false,
                message: "Registration failed",
            });
        }
    }
    async sendOTPForLogin(req, res) {
        try {
            const { phoneNumber } = req.body;
            if (!phoneNumber) {
                res.status(400).json({
                    success: false,
                    message: "Phone number is required for login",
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { phoneNumber: BigInt(phoneNumber) },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found. Please register first.",
                });
                return;
            }
            const otp = otpService_1.default.generateOTP();
            await otpService_1.default.sendOTP(phoneNumber, otp);
            otpStore_1.default.setOTP(phoneNumber, otp);
            res.json({
                success: true,
                message: "OTP sent successfully",
            });
        }
        catch (error) {
            console.error("Login OTP Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send OTP",
            });
        }
    }
    async verifyOTPAndLogin(req, res) {
        try {
            const { identifier, otp } = req.body;
            const record = otpStore_1.default.getOTP(identifier);
            if (!record) {
                res.status(400).json({
                    success: false,
                    message: "Invalid or expired OTP",
                });
                return;
            }
            if (record.otp !== otp) {
                res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { phoneNumber: BigInt(identifier) },
                select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    role: true,
                },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            otpStore_1.default.clearOTP(identifier);
            const token = jwtService_1.default.generateToken({
                id: user.id,
                role: user.role,
            });
            const userForResponse = {
                ...user,
                phoneNumber: user.phoneNumber !== undefined && user.phoneNumber !== null
                    ? user.phoneNumber.toString()
                    : user.phoneNumber,
            };
            res.json({
                success: true,
                message: "Login successful",
                token,
                user: userForResponse,
            });
        }
        catch (error) {
            console.error("Login Verify Error:", error);
            res.status(500).json({
                success: false,
                message: "Login failed",
            });
        }
    }
    async registerStaffAdmin(req, res) {
        try {
            const { name, email, password, role } = req.body;
            if (!["STAFF", "ADMIN"].includes(role)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid role",
                });
                return;
            }
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required for staff/admin registration",
                });
                return;
            }
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "Email already registered",
                });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
            const token = jwtService_1.default.generateToken({
                id: user.id,
                role: user.role,
            });
            res.status(201).json({
                success: true,
                message: "Staff/Admin registered successfully",
                token,
                user,
            });
        }
        catch (error) {
            console.error("Staff Register Error:", error);
            res.status(500).json({
                success: false,
                message: "Registration failed",
            });
        }
    }
    async loginStaffAdmin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required for login",
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user || !user.password) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            const token = jwtService_1.default.generateToken({
                id: user.id,
                role: user.role,
            });
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                success: true,
                message: "Login successful",
                token,
                user: userWithoutPassword,
            });
        }
        catch (error) {
            console.error("Staff Login Error:", error);
            res.status(500).json({
                success: false,
                message: "Login failed",
            });
        }
    }
    async logout(req, res) {
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map