const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: {
    type: String,
  },

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  quizzes: [{
    type: Schema.Types.ObjectId,
    ref: "Quiz"
  }]
});

userSchema.set("timestamps", true);

module.exports = mongoose.model("User", userSchema);