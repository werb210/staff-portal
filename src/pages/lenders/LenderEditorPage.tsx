import { useParams } from "react-router-dom";

export default function LenderEditorPage() {
  const { id } = useParams();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Lender {id}</h2>
      <p className="text-slate-600">Edit lender configuration and product details.</p>
    </div>
  );
}
