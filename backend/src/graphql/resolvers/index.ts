import userResolver from "./user";
import conversationResolver from "./conversation";
import merge from "lodash.merge";

const resolvers = merge({}, userResolver, conversationResolver);

export default resolvers;
