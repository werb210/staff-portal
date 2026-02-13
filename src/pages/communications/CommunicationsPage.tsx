import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";
import ConversationList from "./ConversationList";
import ConversationViewer from "./ConversationViewer";
import { useCommunicationsStore } from "@/state/communications.store";
import { fetchCommunicationThreads, type CommunicationConversation } from "@/api/communications";
import { getErrorMessage } from "@/utils/errors";
import { getRequestId } from "@/utils/requestId";
import RequireRole from "@/components/auth/RequireRole";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { useAuth } from "@/hooks/useAuth";
import { IssueReports } from "@/features/support/IssueReports";
import { ContactSubmissions } from "@/features/support/ContactSubmissions";
import AiQueueView from "@/modules/ai/AiQueueView";

type CommsView = "threads" | "ai-live-chat" | "issue-reports" | "contact-forms";

const CommunicationsContent = () => {
  const {
    setConversations,
    conversations,
    selectedConversationId,
    selectConversation,
    filteredConversations,
    filters,
    setFilters,
    sendReply,
    acknowledgeIssue
  } = useCommunicationsStore();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [view, setView] = useState<CommsView>("threads");
  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  const { data, isLoading, error } = useQuery<CommunicationConversation[], Error>({
    queryKey: ["communications", "threads"],
    queryFn: fetchCommunicationThreads
  });

  useEffect(() => {
    if (data) {
      setConversations(data);
    }
  }, [data, setConversations]);

  useEffect(() => {
    if (error) {
      console.error("Failed to load communications", { requestId: getRequestId(), error });
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && !error) {
      emitUiTelemetry("data_loaded", { view: "communications", count: data?.length ?? 0 });
    }
  }, [data?.length, error, isLoading]);

  return (
    <div className="page space-y-4">
      <Card
        title="Communications Control Room"
        actions={
          <div className="flex gap-2">
            <button onClick={() => setView("threads")}>Threads</button>
            {isAdmin && <button onClick={() => setView("ai-live-chat")}>AI Live Chat</button>}
            {isAdmin && <button onClick={() => setView("issue-reports")}>Issue Reports</button>}
            {isAdmin && <button onClick={() => setView("contact-forms")}>Contact Forms</button>}
          </div>
        }
      >
        {view === "threads" && (
          <>
            {isLoading && <AppLoading />}
            {error && <p className="text-red-700">{getErrorMessage(error, "Unable to load conversations.")}</p>}
            {!isLoading && !error && data?.length === 0 && <p>No conversations available yet.</p>}
            {!isLoading && !error && data?.length !== 0 && (
              <div className="grid h-[70vh] grid-cols-10 gap-4">
                <div className="col-span-3 border-r pr-3">
                  <ConversationList
                    conversations={filteredConversations()}
                    selectedConversationId={selectedConversationId}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSelectConversation={selectConversation}
                  />
                </div>
                <div className="col-span-7">
                  <ConversationViewer
                    conversation={selectedConversation}
                    onSend={async (body, channel) => {
                      if (!selectedConversationId) return;
                      await sendReply(selectedConversationId, body, channel);
                    }}
                    onAcknowledgeIssue={async (id) => acknowledgeIssue(id)}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {view === "ai-live-chat" && <AiQueueView />}
        {view === "issue-reports" && <IssueReports isAdmin={isAdmin} />}
        {view === "contact-forms" && <ContactSubmissions isAdmin={isAdmin} />}
      </Card>
    </div>
  );
};

const CommunicationsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <CommunicationsContent />
  </RequireRole>
);

export default CommunicationsPage;
