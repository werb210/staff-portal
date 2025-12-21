import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";
import ConversationList from "./ConversationList";
import ConversationViewer from "./ConversationViewer";
import { useCommunicationsStore } from "@/state/communications.store";
import { fetchCommunicationThreads } from "@/api/communications";

const CommunicationsPage = () => {
  const {
    loadConversations,
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

  const { isLoading, error } = useQuery({
    queryKey: ["communications", "threads"],
    queryFn: fetchCommunicationThreads,
    onSuccess: () => loadConversations(),
    onError: (err) => console.error("Failed to load communications", err)
  });

  useEffect(() => {
    if (!conversations.length && !isLoading) {
      void loadConversations();
    }
  }, [conversations.length, isLoading, loadConversations]);

  return (
    <div className="page">
      <Card title="Communications Control Room">
        {isLoading && <AppLoading />}
        {error && <p className="text-red-700">Unable to load conversations.</p>}
        {!isLoading && !error && (
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

export default CommunicationsPage;
