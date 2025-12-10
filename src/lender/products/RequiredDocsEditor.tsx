import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export type RequiredDocsEditorProps = {
  categories: string[];
  selectedCategories: string[];
  customDocs: string[];
  onToggleCategory: (category: string) => void;
  onAddCustom: () => void;
  onUpdateCustom: (index: number, value: string) => void;
  onRemoveCustom: (index: number) => void;
};

const RequiredDocsEditor = ({
  categories,
  selectedCategories,
  customDocs,
  onToggleCategory,
  onAddCustom,
  onUpdateCustom,
  onRemoveCustom
}: RequiredDocsEditorProps) => (
  <div>
    <div className="lender-section__header" style={{ marginTop: 12 }}>
      <div className="lender-section__title">Required documents</div>
      <Button type="button" className="ui-button--ghost" onClick={onAddCustom}>
        Add Custom Requirement
      </Button>
    </div>
    <div className="lender-doc-list">
      {categories.map((category) => (
        <label key={category} className="lender-doc-item">
          <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => onToggleCategory(category)} />
          <span>{category}</span>
        </label>
      ))}
      {customDocs.map((doc, index) => (
        <div key={`custom-${index}`} className="lender-doc-item lender-doc-custom">
          <Input value={doc} placeholder="Custom document" onChange={(e) => onUpdateCustom(index, e.target.value)} />
          <Button type="button" className="ui-button--ghost" onClick={() => onRemoveCustom(index)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default RequiredDocsEditor;
