import { gql } from "@apollo/client";
import { MessageFields } from "./message";

const conversationFields = `
          id
          participants {
            user {
              id
              username
            }
            hasSeenLatestMessage
          }
          latestMessage {
           ${MessageFields}
          }
          updatedAt`;

const conversationOperation = {
  Queries: {
    conversations: gql`
      query Conversations {
        conversations {
          ${conversationFields}
        }
      }
    `,
  },

  Mutations: {
    startConversation: gql`
      mutation StartConversation($participantIds: [String]!) {
        startConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
  },

  Subscriptions: {
    conversationStarted: gql`
      subscription ConversationStarted {
        conversationStarted{
          ${conversationFields}
        }
      }
    `,
  },
};

export default conversationOperation;
