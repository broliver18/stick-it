const express = require("express");
const router = express.Router();

const { getAllQuizzes, getQuiz, createQuiz, deleteQuiz } = require("../controllers/quizController");

router.get("/quizzes", getAllQuizzes);

router.get("quiz/:id", getQuiz);

router
  .route("/quiz")
  .post(createQuiz)
  .delete(deleteQuiz);

module.exports = router;
