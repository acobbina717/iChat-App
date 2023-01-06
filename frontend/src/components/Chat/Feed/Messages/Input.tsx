import { FormEvent, useState } from "react";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { toast } from "react-hot-toast";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput = ({ conversationId, session }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");

  const onSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    try {
    } catch (error) {
      if (error instanceof Error) {
        console.log("onSendMessageError:", error);
        toast.error(error.message);
      }
    }
  };

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={() => {}}>
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
