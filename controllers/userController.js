const User = require("../models/user");

const userController = {
  getUser: (email) => User.findOne({ email }).then((user) => user),
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

module.exports = userController;