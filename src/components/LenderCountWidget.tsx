import { useEffect, useState } from "react";
import { withApiBase } from "@/lib/apiBase";

export default function LenderCountWidget() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(withApiBase("/api/public/lender-count"))
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  return <div>Active Lenders: {count}</div>;
}

