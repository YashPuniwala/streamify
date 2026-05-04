import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { Channel, ChannelHeader, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import toast from "react-hot-toast";
import CallButton from "../components/callButton";
import ChatLoader from "../components/chatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    setChatClient(null);
    setChannel(null);
    setLoading(true);
    setError(null);

    let clientInstance: StreamChat | null = null;
    let isMounted = true;

    const initChat = async () => {
      if (!tokenData?.token || !user || !targetUserId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientInstance = client;

        await client.connectUser(
          {
            id: user._id,
            name: user.fullName,
            image: user.profilePic,
          },
          tokenData.token
        );

        const channelId = [user._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [user._id, targetUserId],
        });

        await currChannel.watch();

        if (isMounted) {
          setChatClient(client);
          setChannel(currChannel);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (isMounted) {
          setError("Could not connect to chat. Please try again.");
          toast.error("Could not connect to chat. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (clientInstance) {
        clientInstance.disconnectUser();
        console.log("Chat client disconnected");
      }
    };
  }, [tokenData, user, targetUserId]);

  if (loading) {
    return (
      <div className="h-[93vh] grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[93vh] grid place-items-center">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md">
          <div className="text-red-500 font-medium">{error}</div>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`
      })

      toast.success("Video call link send successfully!")
    }
  }

    if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>

          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;