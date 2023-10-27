import mongoose from "mongoose";

interface iAuth {
  email: string;
  password: string;
  name: string;
  verify: boolean;
  token: string;
  secretKey: string;
}

interface iAuthData extends iAuth, mongoose.Document {}

const authModel = new mongoose.Schema<iAuthData>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    secretKey: {
      type: String,
    },
    verify: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model<iAuthData>("auths", authModel);
