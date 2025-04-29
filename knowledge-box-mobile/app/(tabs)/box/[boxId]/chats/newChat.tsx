import { View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import uuid from "react-native-uuid";

import {
  AIServiceChatResponse,
  AIServiceChatResponseCard,
  AIServiceMessage,
  AIServiceRole,
  useAIChatService,
} from "@/src/service/AIService";
import { useLocalSearchParams } from "expo-router";
import { Box, useBoxModel } from "@/src/data/BoxModel";
const AI_USER_ID = AIServiceRole.AI;
const USER_USER_ID = AIServiceRole.User;
const DEFAULT_LANGUAGE = "English";
const NewChat = ({
  boxTitle,
  boxDescription,
}: {
  boxTitle: string;
  boxDescription: string;
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const { chat } = useAIChatService(DEFAULT_LANGUAGE, boxTitle, boxDescription);
  const createUserMessage = (message: string) => {
    return {
      _id: uuid.v4(),
      text: message,
      createdAt: new Date(),
      user: {
        _id: USER_USER_ID,
        name: "User",
      },
    };
  };
  const createAIMessage = (message: string) => {
    return {
      _id: uuid.v4(),
      text: message,
      createdAt: new Date(),
      user: {
        _id: AI_USER_ID,
        name: "AI",
      },
    };
  };
  const createStartAIMessage = () => {
    return {
      _id: 1,
      name: "AI",
      text: "Hi! How can I help you?!",
      createdAt: new Date(),
      quickReplies: {
        type: "radio",
        keepIt: true,
        values: [
          {
            title: "New cards",
            value: "cards",
          },
          {
            title: "New note",
            value: "note",
          },
          {
            title: "Quizz",
            value: "quizz",
          },
        ],
      },
      user: {
        _id: AI_USER_ID,
        name: "AI",
      },
    };
  };
  useEffect(() => {
    setMessages([createStartAIMessage()]);
  }, []);

  const onSend = (newMessages: any[]) => {
    console.log("onSend", newMessages);
    // chat().then((data)=>{

    // })
    const history: AIServiceMessage[] = messages.map((m) => ({
      role: m.user._id,
      message: m.text,
    }));
    const reversedHistory = history.reverse();
    console.log("history", history);
    console.log("reversedHistory", reversedHistory);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    chat(newMessages[0].text).then((response: AIServiceChatResponse | null) => {
      if (response === null) {
        console.log("TODO: display error");
        // TODO: display error
      }
      if (response?.message) {
        const message: string = response?.message;
        console.log("response from AI", message);
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [createAIMessage(message)])
        );
      }
      if (response?.cards) {
        const cards: AIServiceChatResponseCard[] = response?.cards;
        const joinedCards: string = cards
          .map((c) => c.front + " : " + c.back)
          .join("\n");
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [
            createAIMessage("Suggested Cards:\n" + joinedCards),
          ])
        );
      }
    });
  };

  // const onSend = useCallback((newMessages: any[]) => {
  //   console.log("onSend", newMessages);
  //   // chat().then((data)=>{

  //   // })
  //   //const history: AIServiceMessage[] = messages.map((m) => ({}));
  //   setMessages((previousMessages) =>
  //     GiftedChat.append(previousMessages, newMessages)
  //   );
  // }, []);

  const onQuickReply = useCallback((quickReply: any) => {
    console.log("quickReply", quickReply);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#ccc" }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
        onQuickReply={(reply) => onQuickReply(reply)}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                right: { color: "#000" },
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: "white",
                },
                right: {
                  backgroundColor: "lightgreen",
                },
              }}
            />
          );
        }}
        timeTextStyle={{
          left: { color: "#000" },
          right: { color: "#000" },
        }}
      />
    </View>
  );
};

const ChatPage = () => {
  const { boxId } = useLocalSearchParams();
  const [box, setBox] = useState<Box | null>(null);
  const { getBoxById } = useBoxModel();

  useEffect(() => {
    getBoxById(Number(boxId)).then((res) => {
      if (res) {
        setBox(res);
      }
    });
  }, [boxId]);
  return (
    <>
      {box !== null && (
        <NewChat boxTitle={box.name} boxDescription={box.description ?? ""} />
      )}
    </>
  );
};

export default ChatPage;
