import React, { useState } from "react";
import { startCall } from "../services/voiceDevice";

export default function DialPad() {
  const [number, setNumber] = useState("");

  const call = async () => {
    if (!number) return;
    await startCall(number);
  };

  return (
    <div>
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Enter number"
      />

      <button onClick={call}>Call</button>
    </div>
  );
}
