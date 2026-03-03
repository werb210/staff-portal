import React from "react";
import DialPad from "./DialPad";
import { hangupCall, muteCall, unmuteCall } from "../services/voiceDevice";

export default function PortalDialer() {
  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: "340px",
        height: "100%",
        background: "#ffffff",
        borderLeft: "1px solid #ddd",
        padding: "20px",
        zIndex: 1000
      }}
    >
      <h3>Dialer</h3>

      <DialPad />

      <div style={{ marginTop: 20 }}>
        <button onClick={muteCall}>Mute</button>
        <button onClick={unmuteCall}>Unmute</button>
        <button onClick={hangupCall}>Hangup</button>
      </div>
    </div>
  );
}
