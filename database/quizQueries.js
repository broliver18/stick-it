const Quiz = require("../models/quiz");
const userQueries = require("../database/userQueries");

const quizQueries = {
  getQuiz: (id) => Quiz.findOne({ _id: id }).then((quiz) => quiz),

  removeQuiz: (id) =>
    Quiz.deleteOne({ _id: id }).then((status) => console.log(status)),

  createQuiz: async (user, quizDetails, questions) => {
    const { quizName, minPoints, maxPoints } = quizDetails;
    try {
      const userQuizzes = await userQueries.getUserQuizzes(user.email);
      if (userQuizzes.find((quiz) => quiz.quizName === quizName)) {
        return "A quiz with this name already exists.";
      } else {
        const quiz = await Quiz.create({
          user: user.id,
          quizName,
          minPoints,
          maxPoints,
          questions,
        });
        if (quiz) {
          const currentUser = await userQueries.getUser(user.email);
          if (currentUser) {
            currentUser.quizzes.push(quiz);
            await currentUser.save();
            return "success";
          }
        }
      }
    } catch (e) {
      return e.message;
    }
  },
};

module.exports = quizQueries;
