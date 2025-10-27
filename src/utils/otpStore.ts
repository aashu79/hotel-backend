interface OTPRecord {
  otp: string;
  expiresAt: number;
  userData?: {
    name: string;
    phoneNumber: string;
  };
}

class OTPStore {
  private store: Map<string, OTPRecord> = new Map();

  setOTP(
    identifier: string,
    otp: string,
    userData?: { name: string; phoneNumber: string }
  ): void {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.store.set(identifier, { otp, expiresAt, userData });
  }

  getOTP(identifier: string): OTPRecord | null {
    const record = this.store.get(identifier);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.clearOTP(identifier);
      return null;
    }

    return record;
  }

  clearOTP(identifier: string): void {
    this.store.delete(identifier);
  }

  clearExpired(): void {
    for (const [key, value] of this.store.entries()) {
      if (Date.now() > value.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Cleanup expired OTPs every 10 minutes
const otpStore = new OTPStore();
setInterval(() => {
  otpStore.clearExpired();
}, 10 * 60 * 1000);

export default otpStore;
