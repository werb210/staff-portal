import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEverything } from "@/services/searchService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const { data, refetch } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchEverything(query),
    enabled: false,
  });

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return open ? (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search applications, contacts, companies, lenders, tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refetch()}
          />
          <Button onClick={() => refetch()}>Search</Button>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {data?.results?.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.type}</p>
            </div>
          ))}
          {!data && <p className="text-sm text-muted-foreground">Type to search across the portal.</p>}
        </div>
      </div>
    </div>
  ) : null;
}
