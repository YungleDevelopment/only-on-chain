import React from "react";

interface FilterOption {
  id: string;
  label: string;
}

interface UploadsFiltersProps {
  dateFilter: string;
  setDateFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  dateFilterOptions: FilterOption[];
  typeFilterOptions: FilterOption[];
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}

const UploadsFilters: React.FC<UploadsFiltersProps> = ({
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  onSearch,
  dateFilterOptions,
  typeFilterOptions,
  viewMode,
  setViewMode,
}) => (
  <div className="flex flex-col gap-4 w-full max-w-[800px]">
    <div className="w-full mb-2.5">
      <form onSubmit={onSearch} className="flex w-full">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow py-2.5 px-4 rounded-l-md bg-[var(--color-bg-card)] text-[var(--color-primary-tw)] border border-[var(--color-border)] border-r-0"
        />
        <button type="submit" className="py-2.5 px-4 rounded-r-md bg-[var(--color-bg-hover)] text-[var(--color-primary-tw)] border border-[var(--color-border)] cursor-pointer transition-colors duration-200 hover:bg-[var(--color-bg-active)]">
          <span role="img" aria-label="search">🔍</span>
        </button>
      </form>
    </div>
    <div className="flex gap-4 items-center flex-wrap justify-between">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--color-text-secondary)]">Filter by Date</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="py-2 px-3 rounded-md bg-[#1a1a2a] text-white border border-[#333] min-w-[120px]"
        >
          {dateFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--color-text-secondary)]">Filter by Type</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-2 px-3 rounded-md bg-[#1a1a2a] text-white border border-[#333] min-w-[120px]"
        >
          {typeFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-1.5">
        <button
          className={`w-10 h-10 flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-primary-tw)] rounded-md cursor-pointer transition-colors duration-200 hover:bg-[var(--color-bg-hover)] ${
            viewMode === "grid" ? "bg-[var(--color-bg-active)] border-[var(--color-border-active)]" : ""
          }`}
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
        >
          <span role="img" aria-hidden="true">⊞</span>
        </button>
        <button
          className={`w-10 h-10 flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-primary-tw)] rounded-md cursor-pointer transition-colors duration-200 hover:bg-[var(--color-bg-hover)] ${
            viewMode === "list" ? "bg-[var(--color-bg-active)] border-[var(--color-border-active)]" : ""
          }`}
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <span role="img" aria-hidden="true">☰</span>
        </button>
      </div>
    </div>
  </div>
);

export default UploadsFilters;
