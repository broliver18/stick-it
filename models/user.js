require("dotenv").config();

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

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
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
});

userSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      expiresIn: "72h",
      id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET
  );
  return token;
};

userSchema.set("timestamps", true);

module.exports = mongoose.model("User", userSchema);
