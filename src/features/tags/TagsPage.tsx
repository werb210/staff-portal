import { Tag } from "lucide-react";

export default function TagsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Tags</h1>
      </div>
      <p className="text-sm text-slate-600">
        Tag management will be wired to the live API soon. In the meantime, this page is available as a
        placeholder.
      </p>
    </div>
  );
}
