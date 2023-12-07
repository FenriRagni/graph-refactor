const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async(parent, args, context) => {
      if (context.user) {
        return User.fineOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    }
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, profile };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if(!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if(!correctPw) {
        throw AuthenticationError; 
      }

      const token = signToken(user);
      return { token, profile };
    },

    saveBook: async (parent, args, context) => {
      if (context.user) {
        return User.fineOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: {...args} }
          },
          { new: true, runValidators: true }
        );
      }
      throw AuthenticationError;
    },

    deleteBook: async (parent, args, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId }}},
          { new: true }
        );
      }
      throw AuthenticationError;
    }
  }
}

module.exports = resolvers;