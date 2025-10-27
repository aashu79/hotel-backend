import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import OTPService from "../utils/otpService";
import otpStore from "../utils/otpStore";
import JWTService from "../utils/jwtService";
import { Request, Response } from "express";
import {
  UserRegistrationData,
  LoginCredentials,
  OTPVerificationData,
  JWTPayload,
} from "../types/auth";

const prisma = new PrismaClient();

class AuthController {
  // Fetch all staff and admin users (STAFF/ADMIN only)
  async getStaffAndAdmins(req: any, res: any): Promise<void> {
    try {
      if (
        !req.user ||
        (req.user.role !== "STAFF" && req.user.role !== "ADMIN")
      ) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
      const users = await prisma.user.findMany({
        where: { OR: [{ role: "STAFF" }, { role: "ADMIN" }] },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.json({
        success: true,
        users: users.map((u: any) => ({
          ...u,
          phoneNumber: u.phoneNumber ? u.phoneNumber.toString() : null,
        })),
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch staff/admin users" });
    }
  }

  // Fetch all customer users (STAFF/ADMIN only)
  async getCustomers(req: any, res: any): Promise<void> {
    try {
      if (
        !req.user ||
        (req.user.role !== "STAFF" && req.user.role !== "ADMIN")
      ) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
      const users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.json({
        success: true,
        users: users.map((u: any) => ({
          ...u,
          phoneNumber: u.phoneNumber ? u.phoneNumber.toString() : null,
        })),
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch customer users" });
    }
  }
  // Fetch logged-in user's profile
  async getProfile(req: any, res: any): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      res.json({
        success: true,
        user: {
          ...user,
          phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : null,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch profile" });
    }
  }
  // CUSTOMER: Send OTP for registration
  async sendOTPForRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { name, phoneNumber } = req.body as UserRegistrationData;

      // Type guard: ensure phoneNumber exists for customer registration
      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: "Phone number is required for customer registration",
        });
        return;
      }

      // Check if user already exists
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

      const otp = OTPService.generateOTP();
      await OTPService.sendOTP(phoneNumber, otp);

      // Store OTP with user data
      otpStore.setOTP(phoneNumber, otp, { name, phoneNumber });

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Send OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  }

  // CUSTOMER: Verify OTP and register
  async verifyOTPAndRegister(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, otp } = req.body as OTPVerificationData;

      const record = otpStore.getOTP(identifier);
      if (!record || !record.userData) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      // if (record.otp !== otp) {
      //   res.status(400).json({
      //     success: false,
      //     message: "Invalid OTP",
      //   });
      //   return;
      // }

      const isValid = await OTPService.verifyOTP(identifier, otp);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
        return;
      }

      // Create user
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

      // Clear OTP
      otpStore.clearOTP(identifier);

      // Generate JWT
      const token = JWTService.generateToken({
        id: user.id,
        role: user.role,
      });

      // Convert BigInt fields to string for JSON serialization
      const userForResponse = {
        ...user,
        phoneNumber:
          user.phoneNumber !== undefined && user.phoneNumber !== null
            ? user.phoneNumber.toString()
            : user.phoneNumber,
      };
      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: userForResponse,
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  }

  // CUSTOMER: Send OTP for login
  async sendOTPForLogin(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body as LoginCredentials;

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: "Phone number is required for login",
        });
        return;
      }

      // Check if user exists
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

      const otp = OTPService.generateOTP();
      await OTPService.sendOTP(phoneNumber, otp);

      // Store OTP for login (no user data)
      otpStore.setOTP(phoneNumber, otp);

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Login OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  }

  // CUSTOMER: Verify OTP and login
  async verifyOTPAndLogin(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, otp } = req.body as OTPVerificationData;

      const record = otpStore.getOTP(identifier);
      if (!record) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }
      const isValid = await OTPService.verifyOTP(identifier, otp);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
        return;
      }

      // if (record.otp !== otp) {
      //   res.status(400).json({
      //     success: false,
      //     message: "Invalid OTP",
      //   });
      //   return;
      // }

      // Find user
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

      // Clear OTP
      otpStore.clearOTP(identifier);

      // Generate JWT
      const token = JWTService.generateToken({
        id: user.id,
        role: user.role,
      });

      // Convert BigInt fields to string for JSON serialization
      const userForResponse = {
        ...user,
        phoneNumber:
          user.phoneNumber !== undefined && user.phoneNumber !== null
            ? user.phoneNumber.toString()
            : user.phoneNumber,
      };
      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userForResponse,
      });
    } catch (error) {
      console.error("Login Verify Error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  }

  // STAFF/ADMIN: Register
  async registerStaffAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, locationId } =
        req.body as UserRegistrationData;

      // Validate role
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
          message:
            "Email and password are required for staff/admin registration",
        });
        return;
      }

      // Validate locationId for STAFF
      if (role === "STAFF" && !locationId) {
        res.status(400).json({
          success: false,
          message: "Location ID is required for staff registration",
        });
        return;
      }

      // Check if email already exists
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

      // If locationId is provided, verify it exists
      if (locationId) {
        const location = await prisma.location.findUnique({
          where: { id: locationId },
        });
        if (!location) {
          res.status(404).json({
            success: false,
            message: "Location not found",
          });
          return;
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          locationId: locationId || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          locationId: true,
        },
      });

      const token = JWTService.generateToken({
        id: user.id,
        role: user.role,
        locationId: user.locationId || undefined,
      });

      res.status(201).json({
        success: true,
        message: "Staff/Admin registered successfully",
        token,
        user,
      });
    } catch (error) {
      console.error("Staff Register Error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  }

  // STAFF/ADMIN: Login
  async loginStaffAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginCredentials;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required for login",
        });
        return;
      }

      // Find user
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

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Generate JWT
      const token = JWTService.generateToken({
        id: user.id,
        role: user.role,
      });

      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Staff Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  }

  // Logout (client-side: remove token)
  async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

export default new AuthController();
