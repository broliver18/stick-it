const User = require("../models/user");

const userQueries = {
  getUser: (email) => User.findOne({ email }).then((user) => user),

  getUserQuizzes: (email) => User.findOne({ email }).populate("quizzes").then((user) => user.quizzes),

  createUser: async (name, email, password) => {
    try {
      const user = await User.create({
        name,
        email,
        password,
      });
      if (user) return "success";
    } catch (e) {
      return e.message;
    }
  },
};

module.exports = userQueries;
