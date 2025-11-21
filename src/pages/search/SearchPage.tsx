import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Search</h1>
      </div>
      <p className="text-sm text-slate-600">
        Global search is on the way. Once connected to the staff API, you will be able to search across contacts,
        companies, and deals from this page.
      </p>
    </div>
  );
}
