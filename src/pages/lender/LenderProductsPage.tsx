import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LenderProduct {
  id: string;
  name: string;
  maxAmount?: number;
  minAmount?: number;
  productType?: string;
  interestRate?: string;
}

export default function LenderProductsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["lender-products", search],
    queryFn: async () => {
      const res = await axios.get("/api/lenders/products", {
        params: { search },
      });
      return res.data as LenderProduct[];
    },
    staleTime: 1000 * 60,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/lenders/products", {
        name: "New Product",
        productType: "LOC",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender-products"] }),
  });

  const items = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight">Lender Products</h1>
          <p className="text-sm text-slate-600">Manage offerings available to lender users.</p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Add Product
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-base font-medium tracking-tight">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">Type</span>
                <span>{product.productType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Min</span>
                <span>{product.minAmount ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Max</span>
                <span>{product.maxAmount ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Rate</span>
                <span>{product.interestRate ?? "-"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
