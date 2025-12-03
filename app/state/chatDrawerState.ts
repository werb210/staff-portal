import { atom } from "jotai";

export const chatDrawerOpenAtom = atom(false);

export const openChatDrawer = atom(null, (_get, set) => {
  set(chatDrawerOpenAtom, true);
});

export const closeChatDrawer = atom(null, (_get, set) => {
  set(chatDrawerOpenAtom, false);
});
