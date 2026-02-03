import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { usePipelineStore } from "./pipeline.store";
import { SUBMISSION_METHOD_LABELS } from "@/utils/submissionMethods";

const PipelineFilters = () => {
  const filters = usePipelineStore((state) => state.currentFilters);
  const setFilters = usePipelineStore((state) => state.setFilters);
  const resetFilters = usePipelineStore((state) => state.resetFilters);

  return (
    <div className="pipeline-filters">
      <Input
        label="Search"
        placeholder="Business or applicant name"
        value={filters.searchTerm ?? ""}
        onChange={(event) => setFilters({ searchTerm: event.target.value })}
      />
      <Select
        label="Product Category"
        value={filters.productCategory ?? ""}
        onChange={(event) => setFilters({ productCategory: event.target.value || undefined })}
        options={[
          { value: "", label: "All" },
          { value: "startup", label: "Start-Up" },
          { value: "sba", label: "SBA" },
          { value: "term-loan", label: "Term Loan" }
        ]}
      />
      <Select
        label="Submission Method"
        value={filters.submissionMethod ?? ""}
        onChange={(event) => setFilters({ submissionMethod: event.target.value || undefined })}
        options={[
          { value: "", label: "Any" },
          { value: "API", label: SUBMISSION_METHOD_LABELS.API },
          { value: "EMAIL", label: SUBMISSION_METHOD_LABELS.EMAIL },
          { value: "GOOGLE_SHEET", label: SUBMISSION_METHOD_LABELS.GOOGLE_SHEET }
        ]}
      />
      <div className="pipeline-filters__dates">
        <Input
          label="From"
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(event) => setFilters({ dateFrom: event.target.value || undefined })}
        />
        <Input
          label="To"
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(event) => setFilters({ dateTo: event.target.value || undefined })}
        />
      </div>
      <Select
        label="Sort"
        value={filters.sort ?? "newest"}
        onChange={(event) => setFilters({ sort: event.target.value as typeof filters.sort })}
        options={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "highest_amount", label: "Highest Amount" },
          { value: "lowest_amount", label: "Lowest Amount" }
        ]}
      />
      <button className="ui-button ui-button--ghost pipeline-filters__reset" onClick={resetFilters} type="button">
        Reset Filters
      </button>
    </div>
  );
};

export default PipelineFilters;
