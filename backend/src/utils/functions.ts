import { ParticipantPopulated } from "./types";

export const userIsConversationParticipant = (
  participants: Array<ParticipantPopulated>,
  userId: string
): boolean => {
  return !!participants.find((participant) => participant.userId === userId);
};
