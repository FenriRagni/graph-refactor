const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const data = await User.findOne({ _id: context.user._id }).select('-__v -password');
        return  data ;
      }
      throw AuthenticationError;
    }
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if(!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      console.log(user);
      if(!correctPw) {
        throw AuthenticationError; 
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, args, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: {...args} }
          },
          { new: true, runValidators: true }
        );
      }
      throw AuthenticationError;
    },

    removeBook: async (parent, args, context) => {
      if (context.user) {
        console.log('user', context.user);
        console.log('args', args);
        return await User.findOneAndUpdate(
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