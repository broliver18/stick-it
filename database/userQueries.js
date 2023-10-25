const User = require("../models/user");

const userQueries = {
  getUserById: (id) => User.findOne({ _id: id }).then((user) => user),

  getUser: (email) => User.findOne({ email }).then((user) => user),

  getUserQuizzes: (id) =>
    User.findOne({ _id: id })
      .populate("quizzes")
      .then((user) => user.quizzes),

  removeUserQuiz: (email, id) => {
    User.updateOne(
      { email },
      {
        "$pull": {
          "quizzes": id,
        },
      }
    ).then((status) => console.log(status));
  },

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
