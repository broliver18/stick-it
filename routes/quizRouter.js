const express = require("express");
const router = express.Router();

const {
  getAllQuizzes,
  getQuiz,
  modifyQuiz,
  createQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

router.get("/quizzes", getAllQuizzes);

router.route("/quiz/:id").get(getQuiz).put(modifyQuiz);

router.route("/quiz").post(createQuiz).delete(deleteQuiz);

module.exports = router;
