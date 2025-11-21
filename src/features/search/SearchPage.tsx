import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Search</h1>
      </div>
      <p className="text-sm text-slate-600">
        Global search will connect to the Azure Staff Server when the endpoint is available.
      </p>
    </div>
  );
}
