import { View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Bubble, GiftedChat } from "react-native-gifted-chat";

const NewChat = () => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 2,
        text: "This is a quick reply. Do you love Gifted Chat? (radio) KEEP IT",
        createdAt: new Date(),
        quickReplies: {
          type: "radio", // or 'checkbox',
          keepIt: true,
          values: [
            {
              title: "😋 Yes",
              value: "yes",
            },
            {
              title: "📷 Yes, let me show you with a picture!",
              value: "yes_picture",
            },
            {
              title: "😞 Nope. What?",
              value: "no",
            },
          ],
        },
        user: {
          _id: 2,
          name: "React Native",
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages: any[]) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#ccc" }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
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
      <View>
        <Text>Footer</Text>
      </View>
    </View>
  );
};

export default NewChat;
