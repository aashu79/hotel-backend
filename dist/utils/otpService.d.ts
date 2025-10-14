interface OTPServiceInterface {
    generateOTP(): string;
    sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
}
declare class OTPService implements OTPServiceInterface {
    private client;
    constructor();
    generateOTP(): string;
    sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
}
declare const _default: OTPService;
export default _default;
//# sourceMappingURL=otpService.d.ts.map