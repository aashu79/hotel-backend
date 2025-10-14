interface OTPRecord {
    otp: string;
    expiresAt: number;
    userData?: {
        name: string;
        phoneNumber: string;
    };
}
declare class OTPStore {
    private store;
    setOTP(identifier: string, otp: string, userData?: {
        name: string;
        phoneNumber: string;
    }): void;
    getOTP(identifier: string): OTPRecord | null;
    clearOTP(identifier: string): void;
    clearExpired(): void;
}
declare const otpStore: OTPStore;
export default otpStore;
//# sourceMappingURL=otpStore.d.ts.map