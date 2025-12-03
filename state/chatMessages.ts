import { atom } from "jotai";
import { ChatMessage } from "@/types/chat";

export const chatMessagesAtom = atom<ChatMessage[]>([]);
