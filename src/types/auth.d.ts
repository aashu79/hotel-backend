declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "CUSTOMER" | "STAFF" | "ADMIN";
        locationId?: string; // Optional - only for STAFF/ADMIN
      };
    }
  }
}

export interface UserRegistrationData {
  name: string;
  phoneNumber?: string; // Optional for staff/admin
  email?: string; // Optional for customer
  password?: string; // Optional for customer
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  locationId?: string; // Optional - only for STAFF/ADMIN
}

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface OTPVerificationData {
  identifier: string; // This will be phoneNumber for customers
  otp: string;
}
export interface JWTPayload {
  id: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  locationId?: string; // Optional - only for STAFF/ADMIN
}
