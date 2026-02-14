import { useEffect, useState } from "react";
import axios from "axios";

type Rule = {
  rule_key: string;
  rule_value: string;
};

export default function AiControlPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRuleKey, setNewRuleKey] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

  async function loadRules() {
    const res = await axios.get("/api/ai/admin/rules");
    setRules(res.data);
    setLoading(false);
  }

  async function saveRule() {
    await axios.post("/api/ai/admin/rules", {
      rule_key: newRuleKey,
      rule_value: newRuleValue
    });

    setNewRuleKey("");
    setNewRuleValue("");
    await loadRules();
  }

  useEffect(() => {
    void loadRules();
  }, []);

  if (loading) return <div>Loading AI rules...</div>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">AI System Rules</h1>

      <div className="mb-6 space-y-3">
        {rules.map((r) => (
          <div key={r.rule_key} className="rounded border p-3">
            <div className="font-medium">{r.rule_key}</div>
            <div className="text-sm text-gray-600">{r.rule_value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded border p-4">
        <input
          value={newRuleKey}
          onChange={(e) => setNewRuleKey(e.target.value)}
          placeholder="Rule Key"
          className="w-full border p-2"
        />
        <textarea
          value={newRuleValue}
          onChange={(e) => setNewRuleValue(e.target.value)}
          placeholder="Rule Value"
          className="w-full border p-2"
        />
        <button onClick={() => void saveRule()} className="rounded bg-black px-4 py-2 text-white">
          Save Rule
        </button>
      </div>
    </div>
  );
}
