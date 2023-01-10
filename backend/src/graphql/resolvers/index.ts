import userResolver from "./user";
import conversationResolver from "./conversation";
import messageResolver from "./message";
import scalarResolver from "./scalars";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolver,
  conversationResolver,
  messageResolver,
  scalarResolver
);

export default resolvers;
