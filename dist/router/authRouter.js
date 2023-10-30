"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../Controller/authController");
const validatorHandler_1 = __importDefault(require("../utils/validatorHandler"));
const validator_1 = require("../utils/validator");
const router = (0, express_1.Router)();
router
    .route("/create-user")
    .post((0, validatorHandler_1.default)(validator_1.registerValidator), authController_1.register);
router.route("/sign-in").post((0, validatorHandler_1.default)(validator_1.signInValidator), authController_1.signIn);
router.route("/get-all").get(authController_1.getAll);
router.route("/:userID/get-one").get(authController_1.getOne);
router.route("/:userID/delete-one").delete(authController_1.deleteOne);
router
    .route("/:token/change-password")
    .patch((0, validatorHandler_1.default)(validator_1.changedPasswordValidator), authController_1.changePassword);
router
    .route("/reset-password")
    .patch((0, validatorHandler_1.default)(validator_1.resetPasswordValidator), authController_1.resetPasword);
router.route("/:token/first-verify").get(authController_1.firstVerified);
router.route("/:token/verify-account").get(authController_1.verifyAccount);
router.route("/:token/verify-account").get(authController_1.verifyAccount);
exports.default = router;
