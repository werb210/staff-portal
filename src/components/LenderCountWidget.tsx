import { useEffect, useState } from "react";

export default function LenderCountWidget() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/public/lender-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  return <div>Active Lenders: {count}</div>;
}

