import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: Number },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!this.isOAuthUser) {
          return typeof v === 'string' && v.trim().length > 0;
        }
        return true;
      },
      message: 'passwordHash is required'
    }
  },
  isOAuthUser: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  publicKey: { type: String },
  joinedChannels: [{
    type: String,
    ref: "Channel",
    validate: {
      validator: function(v) {
        return /^chnl_[A-Za-z0-9_]+$/.test(v);
      },
      message: props => `${props.value} is not a valid channel ID!`
    }
  }],
  contacts: [{ type: Number, ref: "User" }],
  isEmailVerified: { type: Boolean, default: false },
  devices: [{ deviceId: String, lastLogin: Date }],
  mfaEnabled: { type: Boolean, default: false },
  otpSecret: { type: String },
}, { timestamps: true });

// Pre-validation hook to auto-assign _id if not set
userSchema.pre("validate", async function (next) {
  if (this._id == null) {
    const lastUser = await this.constructor.findOne().sort({ _id: -1 }).select("_id");
    this._id = lastUser ? Number(lastUser._id) + 1 : 1;
  }
  // For OAuth users, we ignore the passwordHash requirement.
  if (this.isOAuthUser) {
    this.passwordHash = undefined;
  }
  next();
});

export const User = mongoose.model("User", userSchema);
