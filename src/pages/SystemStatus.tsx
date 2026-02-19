import { buildInfo } from "../buildInfo";

export default function SystemStatus() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Portal Status</h1>
      <p>Mode: {buildInfo.mode}</p>
      <p>Build Timestamp: {buildInfo.timestamp}</p>
      <p>Status: OK</p>
    </div>
  );
}
