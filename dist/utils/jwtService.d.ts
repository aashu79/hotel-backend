import { JWTPayload } from "../types/auth";
interface JWTServiceInterface {
    generateToken(payload: JWTPayload): string;
    verifyToken(token: string): JWTPayload;
}
declare class JWTService implements JWTServiceInterface {
    private secret;
    private expiresIn;
    constructor();
    generateToken(payload: JWTPayload): string;
    verifyToken(token: string): JWTPayload;
}
declare const _default: JWTService;
export default _default;
//# sourceMappingURL=jwtService.d.ts.map