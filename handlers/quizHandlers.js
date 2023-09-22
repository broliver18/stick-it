const quizQueries = require("../database/quizQueries");

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
      const createdQuiz = quizQueries.createQuiz(questions, quizDetails);
      createdQuiz.then((message) => socket.emit("create-quiz", message));
    }
  };

  const initializeQuizzes = () =>
    quizQueries
      .getAllQuizzes()
      .then((quizzes) => socket.emit("get-all-quizzes", quizzes));

  const deleteQuiz = (gameId) => quizQueries.removeQuiz(gameId);

  socket.on("quiz-info", quizInfo);
  socket.on("initialize-quizzes", initializeQuizzes);
  socket.on("delete-quiz", deleteQuiz);
};
