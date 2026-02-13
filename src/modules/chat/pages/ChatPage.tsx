import RequireRole from "@/components/auth/RequireRole";
import Card from "@/components/ui/Card";
import ChatWindow from "../components/ChatWindow";

const ChatPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <div className="page">
      <Card title="Live Chat">
        <ChatWindow />
      </Card>
    </div>
  </RequireRole>
);

export default ChatPage;
