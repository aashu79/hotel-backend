"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const auth_1 = require("./middleware/auth");
const menuCategoryRoute_1 = __importDefault(require("./routes/menuCategoryRoute"));
const menuItemRoute_1 = __importDefault(require("./routes/menuItemRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["https://hotel-himalyan.netlify.app", "http://localhost:4000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/auth", authRoute_1.default);
app.use("/api/menu-categories", menuCategoryRoute_1.default);
app.use("/api/menu-items", menuItemRoute_1.default);
app.get("/api/protected", auth_1.authenticateToken, (req, res) => {
    res.json({
        message: "This is a protected route",
        user: req.user,
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map