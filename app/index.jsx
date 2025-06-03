//Functioning chatbot app with chat streaming
//when saving messages, close the websocket manually to add currentBotResponse,
// or add currentBotResponse to messages manually before saving

import { useEffect, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [currentBotResponse, setCurrentBotResponse] = useState(""); // Temporary storage for streaming response

  useEffect(() => {
    const socket = new WebSocket("http://123.456.7.89:3001/"); // Change as needed
    setWs(socket);
  
    socket.onmessage = (event) => {
      const chunk = event.data;
      setCurrentBotResponse(prev => prev + chunk);  // Accumulate chunks
    };
  
    socket.onclose = () => {
      if (currentBotResponse) {
        setMessages(prev => [...prev, { role: "assistant", content: currentBotResponse }]);
        setCurrentBotResponse(""); // Clear buffer
      }
    };
  
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input.trim()) {
      const updatedMessages = [...messages, { role: "user", content: input }];
      if (currentBotResponse) {
        setMessages((prev) => [...prev, { role: "assistant", content: currentBotResponse }]);
        setCurrentBotResponse("");
      }
  
      setMessages((prev) => [...prev, { role: "user", content: input, }]);
      //ws.send(input);
      ws.send(JSON.stringify({ messages: updatedMessages }));
      setInput("");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chat} keyboardDismissMode="on-drag">
        {messages.map((msg, index) => (
          <Text key={index} style={msg.role === "user" ? styles.user : styles.assistant}>
            {msg.content}
          </Text>
        ))}

        {/* Show the ongoing bot response */}
        {currentBotResponse ? (
          <Text style={styles.tempBot}>{currentBotResponse}</Text>
        ) : null}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardDismissMode="on-drag">
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
        <Button title="Print Chat" onPress={()=>{
          messages.forEach(function(dataa) {
            console.log(dataa.role+": "+dataa.content);
          });
        }} />
        <View style={{height: 90}}/> 
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  chat: { flex: 1 },
  user: { alignSelf: "flex-end", backgroundColor: "#007AFF", color: "white", padding: 10, borderRadius: 10, marginVertical: 5 },
  assistant: { alignSelf: "flex-start", backgroundColor: "#ddd", padding: 10, borderRadius: 10, marginVertical: 5 },
  tempBot: { alignSelf: "flex-start", backgroundColor: "#63ffbc", padding: 10, borderRadius: 10, marginVertical: 5 },
  input: { height: 40, borderColor: "gray", borderWidth: 1, padding: 10, marginBottom: 10 },
});
