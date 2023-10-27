import { Router } from "express";
import {
  changePassword,
  deleteOne,
  firstVerified,
  getAll,
  getOne,
  register,
  resetPasword,
  signIn,
  verifyAccount,
} from "../Controller/authController";
import validatorHandler from "../utils/validatorHandler";
import {
  changedPasswordValidator,
  registerValidator,
  resetPasswordValidator,
  signInValidator,
} from "../utils/validator";

const router = Router();

router
  .route("/create-user")
  .post(validatorHandler(registerValidator), register);
router.route("/sign-in").post(validatorHandler(signInValidator), signIn);
router.route("/get-all").get(getAll);
router.route("/:userID/get-one").get(getOne);
router.route("/:userID/delete-one").delete(deleteOne);
router
  .route("/:token/change-password")
  .patch(validatorHandler(changedPasswordValidator), changePassword);
router
  .route("/reset-password")
  .patch(validatorHandler(resetPasswordValidator), resetPasword);
router.route("/:token/first-verify").get(firstVerified);
router.route("/:token/verify-account").get(verifyAccount);
export default router;
