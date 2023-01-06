import userResolver from "./user";
import conversationResolver from "./conversation";
import messageResolver from "./message";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolver,
  conversationResolver,
  messageResolver
);

export default resolvers;
