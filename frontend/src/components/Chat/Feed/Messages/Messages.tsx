import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import {
  MessagesData,
  MessageSubscriptionData,
  MessagesVariables,
} from "../../../../utils/types";
import MessageOperations from "../../../../graphql/operations/message";
import { toast } from "react-hot-toast";
import SkeletonLoader from "../../../Loader/SkeletonLoader";
import MessageItem from "./MessageItem";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

const Messages = ({ conversationId, userId }: MessagesProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(MessageOperations.Queries.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  if (error) null;

  const subscribeToNewMessages = (conversationId: string) => {
    subscribeToMore({
      document: MessageOperations.Subscriptions.messageSent,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData.data) return prev;
        console.log("SUBSCRIBTION DATA", subscriptionData);

        const newMessage = subscriptionData.data.messageSent;

        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToNewMessages(conversationId);
  }, [conversationId]);

  console.log("Messages Data", data);

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack spacing={3} padding={4}>
          <SkeletonLoader count={4} height="60px" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {data.messages.map((message, idx) => (
            <MessageItem
              key={idx}
              message={message}
              sentByMe={message.sender.id === userId}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
