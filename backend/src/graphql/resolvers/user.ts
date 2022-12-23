import { User } from "@prisma/client";
import { GraphQLError } from "graphql";
import { CreateUsernameResponse, GraphQlContext } from "../../utils/types";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQlContext
    ): Promise<Array<User>> => {
      const { username: searchedUsername } = args;
      const { prisma, session } = context;
      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }
      const {
        user: { username: myUsername },
      } = session;

      try {
        const users = await prisma.user.findMany({
          where: {
            username: { contains: searchedUsername, mode: "insensitive" },
          },
        });

        return users;
      } catch (error: any) {
        console.log("searchUserError", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQlContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }
      const { id: userID } = session.user;

      try {
        // check if username is taken
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUser) {
          return { error: "Username Already Taken" };
        }

        //update username
        await prisma.user.update({
          where: { id: userID },
          data: { username },
        });

        return { success: true };
      } catch (error: any) {
        console.log("CreateUsername error", error);
        return {
          error: error?.message,
        };
      }
    },
  },
};

export default resolvers;
