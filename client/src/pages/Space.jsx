import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

const Space = () => {
  const { roomId, name } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);
  const senderId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/ws?roomId=${roomId}`);

    ws.current.onopen = () => {
      console.log(`Connected to room : ${roomId}`);
    };

    ws.current.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.senderId !== senderId.current) {
        setMessages((prev) => [
          ...prev,
          { message: receivedMessage.text, name: receivedMessage.name },
        ]);
      }
    };

    ws.current.onerror = (error) => {
      console.log(`WS Error: `, error);
    };

    ws.current.onclose = () => {
      console.log(`WS Connection Closed`);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId]);

  const sendMessage = () => {
    if (ws.current && message.trim() !== "") {
      ws.current.send(
        JSON.stringify({
          senderId: senderId.current,
          text: message,
          name,
        })
      );
      const myMessage = { message, name };
      setMessages((prev) => [...prev, myMessage]);
      setMessage("");
    }
  };
  return (
    <main className="bg-zinc-800 h-screen flex flex-col justify-center items-center text-white p-4">
      <div className="w-full max-w-md p-4 bg-zinc-700 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
        <div className="flex flex-col gap-2 overflow-y-auto h-64 bg-zinc-900 p-2 rounded-md mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="bg-zinc-700 p-2 rounded-md">
              <p className="text-red-500">{msg.name}</p>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            className="flex-1 p-2 bg-zinc-600 rounded-md outline-none text-white"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default Space;
