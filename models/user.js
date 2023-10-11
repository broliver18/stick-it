if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bcryptSalt = process.env.BCRYPT_SALT

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
  },
  previousPasswords: [
    {
      type: String,
    },
  ],
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
});

userSchema.set("timestamps", true);

userSchema.pre("save", async (next) => {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(
    this.password,
    Number(bcryptSalt),
  );
  this.password = hashedPassword;
  next();
});

module.exports = mongoose.model("User", userSchema);
