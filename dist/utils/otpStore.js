"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OTPStore {
    constructor() {
        this.store = new Map();
    }
    setOTP(identifier, otp, userData) {
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.store.set(identifier, { otp, expiresAt, userData });
    }
    getOTP(identifier) {
        const record = this.store.get(identifier);
        if (!record)
            return null;
        if (Date.now() > record.expiresAt) {
            this.clearOTP(identifier);
            return null;
        }
        return record;
    }
    clearOTP(identifier) {
        this.store.delete(identifier);
    }
    clearExpired() {
        for (const [key, value] of this.store.entries()) {
            if (Date.now() > value.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}
const otpStore = new OTPStore();
setInterval(() => {
    otpStore.clearExpired();
}, 10 * 60 * 1000);
exports.default = otpStore;
//# sourceMappingURL=otpStore.js.map