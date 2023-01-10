import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/utils/types";

//users
export interface CreateUsernameData {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUsernameVariables {
  username: string;
}

export interface SearchUsersInput {
  username: string;
}

export interface SearchUsersData {
  searchUsers: Array<SearchedUser>;
}

export interface SearchedUser {
  id: string;
  username: string;
}

//Conversations

export interface ConversationData {
  conversations: Array<ConversationPopulated>;
}

export interface StartConversationData {
  startConversation: {
    conversationId: string;
  };
}

export interface StartConversationInput {
  participantIds: Array<string>;
}

export interface ConversationCreatedSubscriptionData {
  subscriptionData: {
    data: {
      conversationStarted: ConversationPopulated;
    };
  };
}

// Messages
export interface MessagesData {
  messages: Array<MessagePopulated>;
}

export interface MessagesVariables {
  conversationId: string;
}

export interface MessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}
