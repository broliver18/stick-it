const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const questionSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    shortAnswer: String,
    multipleChoiceAnswers: [String],
    correctAnswer: Number,
    quizId: String
})

module.exports = mongoose.model("Question", questionSchema);