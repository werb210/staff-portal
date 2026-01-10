import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";
import ConversationList from "./ConversationList";
import ConversationViewer from "./ConversationViewer";
import { useCommunicationsStore } from "@/state/communications.store";
import { fetchCommunicationThreads, type CommunicationConversation } from "@/api/communications";
import { getErrorMessage } from "@/utils/errors";
import RequireRole from "@/components/auth/RequireRole";
import { emitUiTelemetry } from "@/utils/uiTelemetry";

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
      console.error("Failed to load communications", error);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && !error) {
      emitUiTelemetry("data_loaded", { view: "communications", count: data?.length ?? 0 });
    }
  }, [data?.length, error, isLoading]);

  return (
    <div className="page">
      <Card title="Communications Control Room">
        {isLoading && <AppLoading />}
        {error && <p className="text-red-700">{getErrorMessage(error, "Unable to load conversations.")}</p>}
        {!isLoading && !error && data?.length === 0 && (
          <p>No conversations available yet.</p>
        )}
        {!isLoading && !error && data?.length !== 0 && (
          <div className="grid grid-cols-10 gap-4 h-[70vh]">
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
      </Card>
    </div>
  );
};

const CommunicationsPage = () => (
  <RequireRole roles={["ADMIN", "STAFF"]}>
    <CommunicationsContent />
  </RequireRole>
);

export default CommunicationsPage;
