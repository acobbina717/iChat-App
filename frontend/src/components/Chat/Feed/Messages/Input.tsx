import { FormEvent, useState } from "react";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { toast } from "react-hot-toast";
import { useMutation } from "@apollo/client";
import MessageOperations from "../../../../graphql/operations/message";
import { SendMessageArgs } from "../../../../../../backend/src/utils/types";
import { ObjectID } from "bson";
import { MessagesData } from "../../../../utils/types";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput = ({ conversationId, session }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<{ sendMessage: boolean }, SendMessageArgs>(
    MessageOperations.Mutations.sendMessage
  );

  const onSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageBody) return;
    try {
      //
      const { id: senderId } = session.user;
      const messageId = new ObjectID().toString();
      const newMessage: SendMessageArgs = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };

      setMessageBody("");

      const { data, errors } = await sendMessage({
        variables: { ...newMessage },
        optimisticResponse: {
          sendMessage: true,
        },

        update: (cache) => {
          const cacheSnapshot = cache.readQuery<MessagesData>({
            query: MessageOperations.Queries.messages,
            variables: { conversationId },
          }) as MessagesData;

          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: MessageOperations.Queries.messages,
            variables: { conversationId },
            data: {
              ...cacheSnapshot,
              messages: [
                {
                  id: messageId,
                  body: messageBody,
                  senderId: session.user.id,
                  conversationId,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...cacheSnapshot.messages,
              ],
            },
          });
        },
      });

      if (!data?.sendMessage || errors) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("onSendMessageError:", error);
        toast.error(error.message);
      }
    }
  };

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Input
          placeholder="New Message"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          resize="none"
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};

export default MessageInput;
