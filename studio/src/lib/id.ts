import { customAlphabet } from "nanoid";

/** short url-safe ids for document entities (clips, tracks, keyframes) */
export const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
