const quizController = require("../controllers/quizController");

module.exports = (socket) => {
  const quizInfo = (questions, quizDetails) => {
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
      const createdQuiz = quizController.createQuiz(questions, quizDetails);
      createdQuiz.then((message) => socket.emit("create-quiz", message));
    }
  };

  const initializeQuizzes = () =>
    quizController
      .getAllQuizzes()
      .then((quizzes) => socket.emit("get-all-quizzes", quizzes));

  const deleteQuiz = (gameId) => quizController.removeQuiz(gameId);

  socket.on("quiz-info", quizInfo);
  socket.on("initialize-quizzes", initializeQuizzes);
  socket.on("delete-quiz", deleteQuiz);
};
