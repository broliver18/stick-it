const Quiz = require("../models/quiz");

const quizQueries = {
  getQuiz: (gameId) => Quiz.findOne({ _id: gameId }).then((quiz) => quiz),

  getAllQuizzes: () => Quiz.find().then((quizzesArray) => quizzesArray),

  removeQuiz: (id) =>
    Quiz.deleteOne({ _id: id }).then((quiz) => console.log(quiz)),

  createQuiz: async (user, quizDetails, questions) => {
    const { quizName, minPoints, maxPoints } = quizDetails;
    try {
      const existingQuiz = await Quiz.findOne({ quizName });
      if (existingQuiz) {
        return "A quiz with this name already exists.";
      } else {
        const quiz = await Quiz.create({
          user,
          quizName,
          minPoints,
          maxPoints,
          questions,
        });
        if (quiz) return "success";
      }
    } catch (e) {
      return e.message;
    }
  },
};

module.exports = quizQueries;
