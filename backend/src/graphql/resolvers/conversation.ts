import { Prisma } from "@prisma/client";
import { GraphQLError, subscribe } from "graphql";
import { withFilter } from "graphql-subscriptions";
import {
  ConversationPopulated,
  GraphQlContext,
  ConversationStartedSubscriptionPayload,
} from "../../utils/types";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQlContext
    ): Promise<Array<ConversationPopulated>> => {
      const { prisma, session } = context;
      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        /**
         * Find all conversations that user is part of
         */
        const conversations = await prisma.conversation.findMany({
          /**
           * Below has been confirmed to be the correct
           * query by the Prisma team. Has been confirmed
           * that there is an issue on their end
           * Issue seems specific to Mongo
           */
          // where: {
          //   participants: {
          //     some: {
          //       userId: {
          //         equals: id,
          //       },
          //     },
          //   },
          // },

          include: conversationPopulated,
        });
        /**
         * Since above query does not work
         */
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
      } catch (error: any) {
        console.log("ConversationError", error);
        throw new GraphQLError(error?.message);
      }
    },
  },

  Mutation: {
    startConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GraphQlContext
    ): Promise<{ conversationId: string }> => {
      const { prisma, session, pubsub } = context;
      const { participantIds } = args;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // emit CONVERSATIONSTARTED socket event using pubsub
        pubsub.publish("CONVERSATION_STARTED", {
          conversationStarted: conversation,
        });

        return { conversationId: conversation.id };
      } catch (error) {
        console.log("StartConversationError", error);
        throw new GraphQLError("Failed to create conversation");
      }
    },
  },

  Subscription: {
    conversationStarted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_STARTED"]);
        },
        (
          payload: ConversationStartedSubscriptionPayload,
          _: any,
          context: GraphQlContext
        ) => {
          const { session } = context;
          const {
            conversationStarted: { participants },
          } = payload;

          const userIsParticipant = !!participants.find(
            (p) => p.userId === session?.user?.id
          );
          return userIsParticipant;
        }
      ),
    },
  },
};

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: { select: { id: true, username: true } },
      },
    },
  });

export default resolvers;
