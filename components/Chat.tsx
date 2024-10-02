import { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Clipboard,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type MessageType = {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  replyTo?: string;
};

export default ({
  messages,
  onSendMessage,
  onDeleteMessage,
  otherUser,
}: {
  messages: MessageType[];
  onSendMessage: (message: string, replyToId?: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  otherUser: {
    name: string;
    avatar: string;
  };
}): JSX.Element => {
  const [inputText, setInputText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );
  const [showOptions, setShowOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const renderMessage = ({ item }: { item: MessageType }): JSX.Element => {
    const isUser = item.sender === "user";
    const date = item.timestamp.toLocaleDateString();

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <View>
          {messages.indexOf(item) === 0 ||
          date !==
            messages[
              messages.indexOf(item) - 1
            ].timestamp.toLocaleDateString() ? (
            <Text style={styles.dateText}>{date}</Text>
          ) : null}
          <View
            style={[
              styles.messageContainer,
              isUser ? styles.userMessage : styles.otherMessage,
            ]}
          >
            {!isUser && (
              <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
            )}
            <View
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.otherBubble,
                item.replyTo ? styles.repliedMessage : null,
              ]}
            >
              {item.replyTo && (
                <Text style={styles.replyText}>
                  Replying to:{" "}
                  {messages
                    .find((m: MessageType): boolean => m.id === item.replyTo)
                    ?.text.substring(0, 20)}
                  ...
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  isUser ? styles.userText : styles.otherText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleLongPress = (message: MessageType) => {
    setSelectedMessage(message);
    setShowOptions(true);
  };

  const handleReact = () => {
    // Implement emoji reaction logic here
    Alert.alert("React", "Emoji reaction feature to be implemented");
    setShowOptions(false);
  };

  const handleReply = () => {
    if (selectedMessage) {
      setReplyingTo(selectedMessage.id);
      setShowOptions(false);
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const handleDelete = (forEveryone: boolean) => {
    if (selectedMessage) {
      onDeleteMessage(selectedMessage.id, forEveryone);
    }
    setShowOptions(false);
  };

  const handleCopy = () => {
    if (selectedMessage) {
      Clipboard.setString(selectedMessage.text);
      Alert.alert("Copied", "Message copied to clipboard");
    }
    setShowOptions(false);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, replyingTo || undefined);
      setInputText("");
      setReplyingTo(null);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerName}>{otherUser.name}</Text>
        <TouchableOpacity style={styles.headerOptions}>
          <FontAwesome5 name="ellipsis-v" size={20} color="#FFE1FF" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item: MessageType): string => item.id}
          contentContainerStyle={styles.messageList}
          inverted
        />
        {replyingTo && (
          <View style={styles.replyingContainer}>
            <Text style={styles.replyingText}>
              Replying to:{" "}
              {messages
                .find((m: MessageType): boolean => m.id === replyingTo)
                ?.text.substring(0, 30)}
              ...
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <FontAwesome5 name="times" size={20} color="#FFE1FF" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <FontAwesome5 name="paper-plane" size={20} color="#FFE1FF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
          activeOpacity={1}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.option} onPress={handleReact}>
              <Text style={styles.optionText}>React</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleReply}>
              <Text style={styles.optionText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleCopy}>
              <Text style={styles.optionText}>Copy</Text>
            </TouchableOpacity>
            {selectedMessage?.sender === "user" && (
              <>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleDelete(false)}
                >
                  <Text style={styles.optionText}>Delete for me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleDelete(true)}
                >
                  <Text style={styles.optionText}>Delete for everyone</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#433878",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#7E60BF",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    color: "#FFE1FF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  headerOptions: {
    padding: 5,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  otherMessage: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#7E60BF",
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: "#E4B1F0",
    borderBottomLeftRadius: 0,
  },
  repliedMessage: {
    borderLeftWidth: 4,
    borderLeftColor: "#FFE1FF",
    paddingLeft: 10,
  },
  replyText: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 5,
    color: "#FFE1FF",
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#FFE1FF",
  },
  otherText: {
    color: "#433878",
  },
  dateText: {
    textAlign: "center",
    color: "#FFE1FF",
    fontSize: 12,
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#7E60BF",
  },
  input: {
    flex: 1,
    backgroundColor: "#FFE1FF",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: "#433878",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#433878",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "#FFE1FF",
    borderRadius: 10,
    padding: 10,
    width: "80%",
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E4B1F0",
  },
  optionText: {
    fontSize: 16,
    color: "#433878",
  },
  replyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7E60BF",
    padding: 10,
  },
  replyingText: {
    flex: 1,
    color: "#FFE1FF",
    fontSize: 14,
  },
});
