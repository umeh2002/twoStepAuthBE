import { Request, Response } from "express";
import authModel from "../Model/authModel";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  resetAccountPassword,
  sendAccountMail,
  sendFirstAccountMail,
} from "../utils/email";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const salt: any = await bcrypt.genSalt(10);
    const hash: any = await bcrypt.hash(password, salt);
    const value = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(value, "secret");

    const user = await authModel.create({
      email,
      password: hash,
      token,
      name,
    });

    sendFirstAccountMail(user).then(() => {
      console.log("sent mail");
    });
    return res.status(201).json({
      message: "created successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error registering",
      data: error.message,
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await authModel.findOne({ email });

    if (user) {
      const check = await bcrypt.compare(password, user.password);

      if (check) {
        if (user.verify && user.token === "") {
          const token = jwt.sign({ id: user._id }, "secret");
          return res.status(201).json({
            message: "successfully signed in",
            data: token,
          });
        } else {
        }
      } else {
        return res.status(403).json({
          message: "Invalid password",
        });
      }
    } else {
      return res.status(404).json({
        message: "user not registered",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "error",
      data: error.message,
    });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const user = await authModel.find();
    return res.status(200).json({
      message: "success",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error",
      data: error.message,
    });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await authModel.findById(userID);

    return res.status(200).json({
      message: "Success",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await authModel.findByIdAndDelete(userID);

    return res.status(200).json({
      message: "Success",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

export const resetPasword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await authModel.findOne({ email });

    if (user?.verify && user.token === "") {
      const token = jwt.sign({ id: user._id }, "secret");

      const reset = await authModel.findByIdAndUpdate(
        user._id,
        {
          token,
        },
        { new: true }
      );
      resetAccountPassword(user).then(() => {
        console.log("sent reset password mail");
      });
      return res.status(201).json({
        message: "success",
        data: reset,
      });
    } else {
      return res.status(403).json({
        message: "cannot reset password",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const getUserID: any = jwt.verify(
      token,
      "secret",
      (err: any, payload: any) => {
        if (err) {
          return err;
        } else {
          return payload;
        }
      }
    );
    const user = await authModel.findById(getUserID.id);

    if (user?.verify && user.token !== "") {
      const salt: any = await bcrypt.genSalt(10);
      const hash: any = await bcrypt.hash(password, salt);

      const pass = await authModel.findByIdAndUpdate(
        user._id,
        { password: hash, token: "" },
        { new: true }
      );
      return res.status(201).json({
        message: "changed password",
        data: pass,
      });
    } else {
      return res.status(404).json({
        message: "user have not been verified",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "error",
      data: error.message,
    });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const getUserID: any = jwt.verify(
      token,
      "secret",
      (err: any, payload: any) => {
        if (err) {
          return err;
        } else {
          return payload;
        }
      }
    );

    const user = await authModel.findByIdAndUpdate(
      getUserID.id,
      { token: "", verify: true },
      { new: true }
    );

    return res.status(201).json({
      message: "verification successful",
      data: user,
    });
  } catch (error:any) {
    return res.status(404).json({
      message: "error",
      data: error.message,
    });
  }
};

export const firstVerified = async (req: Request, res: Response) => {
  try {
    const { secretKey } = req.body;
    const { token } = req.params;

    jwt.verify(token, "secret", async (err: any, payload: any) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      const user: any = await authModel.findByIdAndUpdate(
        payload.id,
        { secretKey },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      user.secretKey = secretKey;
      try {
        await user.save();
        await sendAccountMail(user);
        console.log("sent verification email");
        return res.status(201).json({
          message: "success",
          data: user,
        });
      } catch (emailError:any) {
        return res.status(500).json({
          message: "Error sending verification email",
          data: emailError.message,
        });
      }
    });
  } catch (error:any) {
    return res.status(500).json({
      message: "Internal server error",
      data: error.message,
    });
  }
};
