import React from "react";
import { useLoaderData } from "react-router-dom";
import api from "../../lib/api";
import MessageList from "../../components/messages/MessageList";

export async function loader({ params }) {
  const { id } = params;
  const appData = await api.get(`/applications/${id}`);
  const messages = await api.get(`/messages/application/${id}`);
  return {
    ...appData.data,
    messages: messages.data.data,
  };
}

export default function ApplicationDetailPage() {
  const data = useLoaderData() as any;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Application {data?.id}</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
        <MessageList messages={data.messages ?? []} />
      </section>
    </div>
  );
}
