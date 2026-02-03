import Select from "@/components/ui/Select";

export type SheetMappingRow = {
  id: string;
  columnName: string;
  systemField: string;
};

const generateRowId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createEmptyMappingRow = (): SheetMappingRow => ({
  id: generateRowId(),
  columnName: "",
  systemField: ""
});

const SYSTEM_FIELD_OPTIONS = [
  { value: "business.legal_name", label: "Business name" },
  { value: "business.dba_name", label: "Business DBA" },
  { value: "business.tax_id", label: "Business tax ID" },
  { value: "application.amount", label: "Application amount" },
  { value: "application.term", label: "Application term" },
  { value: "application.purpose", label: "Loan purpose" },
  { value: "owner.first_name", label: "Owner first name" },
  { value: "owner.last_name", label: "Owner last name" },
  { value: "owner.email", label: "Owner email" },
  { value: "owner.phone", label: "Owner phone" }
];

type GoogleSheetMappingEditorProps = {
  rows: SheetMappingRow[];
  onChange: (rows: SheetMappingRow[]) => void;
  error?: string;
};

const GoogleSheetMappingEditor = ({ rows, onChange, error }: GoogleSheetMappingEditorProps) => {
  const handleRowChange = (id: string, updates: Partial<SheetMappingRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  };

  const handleAddRow = () => {
    onChange([...rows, createEmptyMappingRow()]);
  };

  const handleRemoveRow = (id: string) => {
    const nextRows = rows.filter((row) => row.id !== id);
    onChange(nextRows.length ? nextRows : [createEmptyMappingRow()]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 md:grid-cols-[1fr_1fr_auto]">
        <span>Sheet column name</span>
        <span>System field</span>
        <span className="sr-only">Actions</span>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_1fr_auto]">
          <label className="ui-field">
            <span className="ui-field__label sr-only">Sheet column name</span>
            <input
              className="ui-input"
              placeholder="e.g. Business Name"
              value={row.columnName}
              onChange={(event) => handleRowChange(row.id, { columnName: event.target.value })}
            />
          </label>
          <Select
            label="System field"
            hideLabel
            value={row.systemField}
            onChange={(event) => handleRowChange(row.id, { systemField: event.target.value })}
          >
            <option value="">Select field</option>
            {SYSTEM_FIELD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <button type="button" className="btn btn--secondary" onClick={() => handleRemoveRow(row.id)}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button type="button" className="btn btn--secondary" onClick={handleAddRow}>
          Add column
        </button>
      </div>
      {error ? <div className="ui-field__error">{error}</div> : null}
    </div>
  );
};

export default GoogleSheetMappingEditor;
