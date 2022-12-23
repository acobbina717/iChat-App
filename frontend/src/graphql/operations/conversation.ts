import { gql } from "@apollo/client";

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
            id
            sender {
              id
              username
            }
            body
            createdAt
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
