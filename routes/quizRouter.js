const express = require("express");
const router = express.Router();

const { checkAuthentication } = require("../controllers/authController");

const {
  getAllQuizzes,
  getQuiz,
  modifyQuiz,
  createQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

router.get("/quizzes", checkAuthentication, getAllQuizzes);

router.route("/quiz/:id").get(checkAuthentication, getQuiz).put(checkAuthentication, modifyQuiz);

router.route("/quiz").post(checkAuthentication, createQuiz).delete(checkAuthentication, deleteQuiz);

module.exports = router;
