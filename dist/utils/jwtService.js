"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTService {
    constructor() {
        this.secret = process.env.JWT_SECRET || "default_secret";
        this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    }
    generateToken(payload) {
        const options = {
            expiresIn: this.expiresIn,
        };
        return jsonwebtoken_1.default.sign(payload, this.secret, options);
    }
    verifyToken(token) {
        const verifyOptions = {};
        return jsonwebtoken_1.default.verify(token, this.secret, verifyOptions);
    }
}
exports.default = new JWTService();
//# sourceMappingURL=jwtService.js.map