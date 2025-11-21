import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/ui/skeletons";

export default function LenderProductDetailPage() {
  const { id } = useParams();

  const query = useQuery({
    queryKey: ["lender-product", id],
    queryFn: async () => {
      const res = await axios.get(`/api/lenders/products/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  if (query.isLoading) return <PageSkeleton />;

  const product = query.data ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium tracking-tight">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <div className="flex justify-between">
          <span className="font-medium">Product Type</span>
          <span>{product.productType}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Min Amount</span>
          <span>{product.minAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Max Amount</span>
          <span>{product.maxAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Interest Rate</span>
          <span>{product.interestRate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
