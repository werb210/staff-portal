import { useEffect, useState } from "react";

interface TrendData {
  date: string;
  commission: number;
}

export default function CommissionTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    fetch("/api/analytics/commission-trend", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      {data.map((item) => (
        <div key={item.date}>
          {item.date}: ${item.commission}
        </div>
      ))}
    </div>
  );
}
