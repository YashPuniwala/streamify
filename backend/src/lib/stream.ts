import { StreamChat, UserResponse } from "stream-chat";
import "dotenv/config";

const apiKey: string = process.env.STREAM_API_KEY as string;
const apiSecret: string = process.env.STREAM_API_SECRET as string;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

type StreamUserData = {
  id: string;
  name?: string;
  image?: string;
  [key: string]: any;
};

export const upsertStreamUser = async (
  userData: StreamUserData
): Promise<StreamUserData | undefined> => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId: string): string => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};
