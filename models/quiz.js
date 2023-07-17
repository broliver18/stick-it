const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const questionSchema = new Schema({
    questionType: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    shortAnswer: String,
    answerOne: String,
    answerTwo: String,
    answerThree: String,
    answerFour: String,
    correctAnswer: Number,
})

const quizSchema = new Schema({
    quizName: {
        type: String,
        required: true,
    },
    minPoints: {
        type: Number,
        min: -1000,
        required: true,
    },
    maxPoints: {
        type: Number,
        max: 1000,
        required: true,
    },
    questions: [questionSchema] 
})

module.exports = mongoose.model("Quiz", quizSchema);