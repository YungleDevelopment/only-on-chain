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
  <div className="uploads-controls">
    <div className="search-bar">
      <form onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          <span role="img" aria-label="search">🔍</span>
        </button>
      </form>
    </div>
    <div className="uploads-filters">
      <div className="filter-group">
        <label>Filter by Date</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="filter-select"
        >
          {dateFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Filter by Type</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          {typeFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="view-toggle">
        <button
          className={`view-button ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
        >
          <span role="img" aria-hidden="true">⊞</span>
        </button>
        <button
          className={`view-button ${viewMode === "list" ? "active" : ""}`}
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
