const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const Quiz = require("./models/quiz");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`http://localhost:3000`],
  },
});

async function createQuiz(questions, quizDetails) {
  const { quizName, minPoints, maxPoints } = quizDetails;
  try {
    const existingQuiz = await Quiz.findOne({ quizName })
    if (existingQuiz) {
      return "A quiz with this name already exists.";
    } else {
      const quiz = await Quiz.create({
        quizName,
        minPoints,
        maxPoints,
        questions,
      })
      if (quiz) return "success";
    }
  } catch (e) {
    return e.message;
  }
}

io.on("connection", (socket) => {
  socket.on("display-info", (nameInput, pinInput) => {
    console.log(nameInput);
    console.log(pinInput);
  });

  socket.on("quiz-info", (questions, quizDetails) => {
    if (
      questions.find(
        (questionInfo) =>
          (questionInfo.questionType === "short-answer" &&
            (!questionInfo.question || !questionInfo.shortAnswer)) ||
          (questionInfo.questionType === "multiple-choice" &&
            (!questionInfo.question ||
              !questionInfo.answerOne ||
              !questionInfo.answerTwo ||
              !questionInfo.answerThree ||
              !questionInfo.answerFour ||
              !questionInfo.correctAnswer))
      )
    ) {
      const errorMessage = "Please fill out all required input fields.";
      socket.emit("error-message", errorMessage);
    } else {
      const createdQuiz = createQuiz(questions, quizDetails)
      createdQuiz.then(data => socket.emit("create-quiz", data));
    }
  });
});

const dbURI = `mongodb+srv://brunoolive504:562412504$BMo@stick-it.6mxliys.mongodb.net/stick-it?retryWrites=true&w=majority`;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) =>
    server.listen(4000, () => {
      console.log("Listening on port 4000");
    })
  )
  .catch((err) => console.log(err));
