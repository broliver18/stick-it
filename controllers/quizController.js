const quizQueries = require("../database/quizQueries");
const userQueries = require("../database/userQueries");

const getAllQuizzes = (req, res) => {
  const userEmail = req.session.user.email;
  userQueries
    .getUserQuizzes(userEmail)
    .catch((error) => res.json(error))
    .then((quizzes) => res.json(quizzes));
};

const getQuiz = (req, res) => {
  const quizId = req.params.id;
  quizQueries
    .getQuiz(quizId)
    .catch((error) => res.json(error))
    .then((quiz) => res.json(quiz));
};

const modifyQuiz = async (req, res) => {
  const quizId = req.params.id;
  const { quizDetails, questions } = req.body;
  const { quizName, minPoints, maxPoints } = quizDetails;
  const currentQuiz = await quizQueries.getQuiz(quizId);
  currentQuiz.quizName = quizName;
  currentQuiz.minPoints = minPoints;
  currentQuiz.maxPoints = maxPoints;
  currentQuiz.questions = questions;
  await currentQuiz.save();
  res.json("success");
};

const createQuiz = (req, res) => {
  const { quizDetails, questions } = req.body;
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
    res.json(errorMessage);
  } else {
    const user = req.session.user;
    quizQueries
      .createQuiz(user, quizDetails, questions)
      .catch((error) => res.json(error))
      .then((message) => res.json(message));
  }
};

const deleteQuiz = (req, res) => {
  const { quizId } = req.body;
  const userEmail = req.session.user.email;
  quizQueries.removeQuiz(quizId).catch((error) => res.json(error));
  userQueries.removeUserQuiz(userEmail, quizId);
};

module.exports = { getAllQuizzes, getQuiz, modifyQuiz, createQuiz, deleteQuiz };