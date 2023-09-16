const User = require("../models/user");

const userController = {
  getUser: (email) => User.findOne({ email }).then((user) => user),
  createUser: async (email, password) => {
    try {
      const user = await User.create({
        email,
        password,
      });
      if (user) return "success";
    } catch (e) {
      return e.message;
    }
  },
};

module.exports = userController;