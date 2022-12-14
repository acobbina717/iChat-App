import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";
import {
  GraphQlContext,
  MessagePopulated,
  MessageSentSubscriptionPayload,
  SendMessageArgs,
} from "../../utils/types";
import { conversationPopulated } from "./conversation";

const resolvers = {
  Query: {
    messages: async (
      _: any,
      args: { conversationId: string },
      context: GraphQlContext
    ): Promise<Array<MessagePopulated> | undefined> => {
      const { prisma, session } = context;
      const { conversationId } = args;

      if (!session?.user) throw new GraphQLError("Not authorized");

      const { id: userId } = session.user;

      // Verify user is a participant
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });

      if (!conversation) throw new GraphQLError("Conversation Does Not Exist");

      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );

      if (!allowedToView) throw new GraphQLError("Not authorized");

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });

        return messages;
      } catch (error) {
        if (error instanceof Error) {
          console.log("Message Query Error:", error);
          throw new GraphQLError(error.message);
        }
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArgs,
      context: GraphQlContext
    ): Promise<boolean> => {
      const { prisma, pubsub, session } = context;
      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const { id: userId } = session.user;
      const { id: messageId, senderId, conversationId, body } = args;

      // if (userId !== senderId) {
      //   throw new GraphQLError("Not authorized");
      // }

      try {
        // Create new message
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        // Find conversation participants
        const conversationParticipant =
          await prisma.conversationParticipant.findFirst({
            where: {
              userId,
              conversationId,
            },
          });

        if (!conversationParticipant)
          throw new Error("Participant does not exist");

        const { id: participantId } = conversationParticipant;

        // Update conversation
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: participantId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
          include: conversationPopulated,
        });

        pubsub.publish("Message_Sent", { messageSent: newMessage });
        //   pubsub.publish("Conversation_Updated", {
        //     conversationUpdated: { conversation },
        //   });
      } catch (error) {
        if (error instanceof Error) {
          console.log("sendMesageError:", error.message);
          throw new GraphQLError(error.message);
        }
      }

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator("Message_Sent");
        },
        (
          payload: MessageSentSubscriptionPayload,
          arg: { conversationId: string },
          context: GraphQlContext
        ) => {
          // try {

          // } catch (error) {
          //   if (error instanceof Error) {
          //     console.log("MessageSentSubscriptionError:", error.message);
          //     throw new GraphQLError(error.message);
          //   }
          // }
          return payload.messageSent.conversationId === arg.conversationId;
        }
      ),
    },
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export default resolvers;
