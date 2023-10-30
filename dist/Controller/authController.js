"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstVerified = exports.verifyAccount = exports.changePassword = exports.resetPasword = exports.deleteOne = exports.getOne = exports.getAll = exports.signIn = exports.register = void 0;
const authModel_1 = __importDefault(require("../Model/authModel"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../utils/email");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(password, salt);
        const value = crypto_1.default.randomBytes(16).toString("hex");
        const token = jsonwebtoken_1.default.sign(value, "secret");
        const user = yield authModel_1.default.create({
            email,
            password: hash,
            token,
            name,
        });
        (0, email_1.sendFirstAccountMail)(user).then(() => {
            console.log("sent mail");
        });
        return res.status(201).json({
            message: "created successfully",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error registering",
            data: error.message,
        });
    }
});
exports.register = register;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield authModel_1.default.findOne({ email });
        if (user) {
            const check = yield bcrypt_1.default.compare(password, user.password);
            if (check) {
                if (user.verify && user.token === "") {
                    const token = jsonwebtoken_1.default.sign({ id: user._id }, "secret");
                    return res.status(201).json({
                        message: "successfully signed in",
                        data: token,
                    });
                }
                else {
                }
            }
            else {
                return res.status(403).json({
                    message: "Invalid password",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "user not registered",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "error",
            data: error.message,
        });
    }
});
exports.signIn = signIn;
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authModel_1.default.find();
        return res.status(200).json({
            message: "success",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
        });
    }
});
exports.getAll = getAll;
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield authModel_1.default.findById(userID);
        return res.status(200).json({
            message: "Success",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: error.message,
        });
    }
});
exports.getOne = getOne;
const deleteOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield authModel_1.default.findByIdAndDelete(userID);
        return res.status(200).json({
            message: "Success",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: error.message,
        });
    }
});
exports.deleteOne = deleteOne;
const resetPasword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield authModel_1.default.findOne({ email });
        if ((user === null || user === void 0 ? void 0 : user.verify) && user.token === "") {
            const token = jsonwebtoken_1.default.sign({ id: user._id }, "secret");
            const reset = yield authModel_1.default.findByIdAndUpdate(user._id, {
                token,
            }, { new: true });
            (0, email_1.resetAccountPassword)(user).then(() => {
                console.log("sent reset password mail");
            });
            return res.status(201).json({
                message: "success",
                data: reset,
            });
        }
        else {
            return res.status(403).json({
                message: "cannot reset password",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: error.message,
        });
    }
});
exports.resetPasword = resetPasword;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const getUserID = jsonwebtoken_1.default.verify(token, "secret", (err, payload) => {
            if (err) {
                return err;
            }
            else {
                return payload;
            }
        });
        const user = yield authModel_1.default.findById(getUserID.id);
        if ((user === null || user === void 0 ? void 0 : user.verify) && user.token !== "") {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hash = yield bcrypt_1.default.hash(password, salt);
            const pass = yield authModel_1.default.findByIdAndUpdate(user._id, { password: hash, token: "" }, { new: true });
            return res.status(201).json({
                message: "changed password",
                data: pass,
            });
        }
        else {
            return res.status(404).json({
                message: "user have not been verified",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "error",
            data: error.message,
        });
    }
});
exports.changePassword = changePassword;
const verifyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const getUserID = jsonwebtoken_1.default.verify(token, "secret", (err, payload) => {
            if (err) {
                return err;
            }
            else {
                return payload;
            }
        });
        const user = yield authModel_1.default.findByIdAndUpdate(getUserID.id, { token: "", verify: true }, { new: true });
        return res.status(201).json({
            message: "verification successful",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error",
            data: error.message,
        });
    }
});
exports.verifyAccount = verifyAccount;
const firstVerified = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { secretKey } = req.body;
        const { token } = req.params;
        jsonwebtoken_1.default.verify(token, "secret", (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({
                    message: "Invalid token",
                });
            }
            const user = yield authModel_1.default.findByIdAndUpdate(payload.id, { secretKey }, { new: true });
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            user.secretKey = secretKey;
            try {
                yield user.save();
                yield (0, email_1.sendAccountMail)(user);
                console.log("sent verification email");
                return res.status(201).json({
                    message: "success",
                    data: user,
                });
            }
            catch (emailError) {
                return res.status(500).json({
                    message: "Error sending verification email",
                    data: emailError.message,
                });
            }
        }));
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            data: error.message,
        });
    }
});
exports.firstVerified = firstVerified;
