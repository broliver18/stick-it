const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionType: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  shortAnswer: String,
  answerOne: String,
  answerTwo: String,
  answerThree: String,
  answerFour: String,
  correctAnswer: Number,
});

const quizSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",   
  },
  quizName: {
    type: String,
    required: true,
    maxLength: 15,
  },
  minPoints: {
    type: Number,
    required: true,
    min: -1000,
  },
  maxPoints: {
    type: Number,
    required: true,
    max: 1000,
  },
  questions: [questionSchema],
});

module.exports = mongoose.model("Quiz", quizSchema);
