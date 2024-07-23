const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "The Email is mandatory"],
      validate: {
        validator: (val) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "The Password is mandatory"],
      validate: {
        validator: (val) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-=_+{};:'",.<>/?[\]`|~]).{8,}$/.test(val),
        message:
          "Password must have at least one uppercase, one lowercase, one number, one special character",
      },
    },
    firstName: {
      type: String,
      required: [true, "Please complete this input"],
    },
    lastName: {
      type: String,
      required: [true, "Please complete this input"],
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    wallet: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.plugin(uniqueValidator, {
  message: "Email {VALUE} is already taken",
});

// Virtual for confirmPassword
UserSchema.virtual("confirmPassword")
  .get(function () {
    return this._confirmPassword;
  })
  .set(function (value) {
    this._confirmPassword = value;
  });

// Validate confirmPassword
UserSchema.pre("validate", function (next) {
  if (this.isModified("password") && this.password !== this.confirmPassword) {
    this.invalidate("confirmPassword", "Password must match confirm password");
  }
  next();
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash password before updating
UserSchema.pre("findOneAndUpdate", async function (next) {
  const data = this.getUpdate();
  if (data.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
