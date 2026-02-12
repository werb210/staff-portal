export async function getSupportQueue() {
  const res = await fetch("/api/support/queue");
  return res.json();
}

export async function getIssueReports() {
  const res = await fetch("/api/support/issues");
  return res.json();
}

export async function getAIKnowledge() {
  const res = await fetch("/api/ai/knowledge");
  return res.json();
}
