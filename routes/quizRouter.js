const express = require("express");
const router = express.Router();

const { getAllQuizzes, getQuiz, createQuiz, deleteQuiz } = require("../controllers/quizController");

router.get("/quizzes", getAllQuizzes);

router
  .route("/quiz")
  .get(getQuiz)
  .post(createQuiz)
  .delete(deleteQuiz);

module.exports = router;
