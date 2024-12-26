import React, { useState } from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const [roomName, setRoomName] = useState("");
  const [name,setName] = useState("")
  const navigate = useNavigate();
  return (
    <main className="bg-zinc-800 h-screen flex justify-center items-center">
      <div>
        <input
          type="text"
          placeholder="Enter Room Name"
          className="bg-transparent border block border-white p-2 text-white"
          onChange={(e) => {
            setRoomName(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Enter Your Name"
          className="bg-transparent border mt-4 border-white p-2 text-white"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <div className="flex justify-center py-5 space-x-6">
          <button
            className="p-3 border border-white text-white bg-red-600 rounded-md"
            onClick={() => {
              if (roomName && name) {
                navigate(`/room/${roomName.toLowerCase()}/${name}`);
              }
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
  );
};

export default Home;
