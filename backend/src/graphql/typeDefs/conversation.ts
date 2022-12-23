import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type Conversation {
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type StartConversationResponse {
    conversationId: String
  }

  type Query {
    conversations: [Conversation]
  }

  type Mutation {
    startConversation(participantIds: [String]): StartConversationResponse
  }

  type Subscription {
    conversationStarted: Conversation
  }
`;

export default typeDefs;
