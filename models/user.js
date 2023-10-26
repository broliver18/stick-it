require("dotenv").config();


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
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
});

userSchema.set("timestamps", true);

module.exports = mongoose.model("User", userSchema);
