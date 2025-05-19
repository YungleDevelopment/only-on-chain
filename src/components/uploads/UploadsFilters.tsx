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
  <div className="flex flex-col gap-4 w-full">
    <div className="flex items-center w-full flex-wrap gap-8 font-thin">
      <div className="flex items-center border border-white rounded-full overflow-hidden">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-4 cursor-pointer ${
            viewMode === "grid" ? "bg-[rgba(255,255,255,0.15)]" : ""
          }`}
          aria-label="Grid view"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M0.888889 7.11111H6.22222C6.45797 7.11111 6.68406 7.01746 6.85076 6.85076C7.01746 6.68406 7.11111 6.45797 7.11111 6.22222V0.888889C7.11111 0.653141 7.01746 0.427048 6.85076 0.260349C6.68406 0.0936505 6.45797 0 6.22222 0H0.888889C0.653141 0 0.427048 0.0936505 0.260349 0.260349C0.0936505 0.427048 0 0.653141 0 0.888889V6.22222C0 6.45797 0.0936505 6.68406 0.260349 6.85076C0.427048 7.01746 0.653141 7.11111 0.888889 7.11111ZM9.77778 7.11111H15.1111C15.3469 7.11111 15.573 7.01746 15.7397 6.85076C15.9064 6.68406 16 6.45797 16 6.22222V0.888889C16 0.653141 15.9064 0.427048 15.7397 0.260349C15.573 0.0936505 15.3469 0 15.1111 0H9.77778C9.54203 0 9.31594 0.0936505 9.14924 0.260349C8.98254 0.427048 8.88889 0.653141 8.88889 0.888889V6.22222C8.88889 6.45797 8.98254 6.68406 9.14924 6.85076C9.31594 7.01746 9.54203 7.11111 9.77778 7.11111ZM0.888889 16H6.22222C6.45797 16 6.68406 15.9064 6.85076 15.7397C7.01746 15.573 7.11111 15.3469 7.11111 15.1111V9.77778C7.11111 9.54203 7.01746 9.31594 6.85076 9.14924C6.68406 8.98254 6.45797 8.88889 6.22222 8.88889H0.888889C0.653141 8.88889 0.427048 8.98254 0.260349 9.14924C0.0936505 9.31594 0 9.54203 0 9.77778V15.1111C0 15.3469 0.0936505 15.573 0.260349 15.7397C0.427048 15.9064 0.653141 16 0.888889 16ZM9.77778 16H15.1111C15.3469 16 15.573 15.9064 15.7397 15.7397C15.9064 15.573 16 15.3469 16 15.1111V9.77778C16 9.54203 15.9064 9.31594 15.7397 9.14924C15.573 8.98254 15.3469 8.88889 15.1111 8.88889H9.77778C9.54203 8.88889 9.31594 8.98254 9.14924 9.14924C8.98254 9.31594 8.88889 9.54203 8.88889 9.77778V15.1111C8.88889 15.3469 8.98254 15.573 9.14924 15.7397C9.31594 15.9064 9.54203 16 9.77778 16Z"
              fill="white"
            />
          </svg>
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-4 cursor-pointer ${
            viewMode === "list" ? "bg-[rgba(255,255,255,0.15)]" : ""
          }`}
          aria-label="List view"
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path
              d="M1.73379 6.4C0.848456 6.4 0.133789 7.11467 0.133789 8C0.133789 8.88533 0.848456 9.6 1.73379 9.6C2.61912 9.6 3.33379 8.88533 3.33379 8C3.33379 7.11467 2.61912 6.4 1.73379 6.4ZM1.73379 0C0.848456 0 0.133789 0.714667 0.133789 1.6C0.133789 2.48533 0.848456 3.2 1.73379 3.2C2.61912 3.2 3.33379 2.48533 3.33379 1.6C3.33379 0.714667 2.61912 0 1.73379 0ZM1.73379 12.8C0.848456 12.8 0.133789 13.5253 0.133789 14.4C0.133789 15.2747 0.859122 16 1.73379 16C2.60846 16 3.33379 15.2747 3.33379 14.4C3.33379 13.5253 2.61912 12.8 1.73379 12.8ZM6.00046 15.4667H18.8005C19.3871 15.4667 19.8671 14.9867 19.8671 14.4C19.8671 13.8133 19.3871 13.3333 18.8005 13.3333H6.00046C5.41379 13.3333 4.93379 13.8133 4.93379 14.4C4.93379 14.9867 5.41379 15.4667 6.00046 15.4667ZM6.00046 9.06667H18.8005C19.3871 9.06667 19.8671 8.58667 19.8671 8C19.8671 7.41333 19.3871 6.93333 18.8005 6.93333H6.00046C5.41379 6.93333 4.93379 7.41333 4.93379 8C4.93379 8.58667 5.41379 9.06667 6.00046 9.06667ZM4.93379 1.6C4.93379 2.18667 5.41379 2.66667 6.00046 2.66667H18.8005C19.3871 2.66667 19.8671 2.18667 19.8671 1.6C19.8671 1.01333 19.3871 0.533333 18.8005 0.533333H6.00046C5.41379 0.533333 4.93379 1.01333 4.93379 1.6Z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      <div className="relative flex-grow max-w-md mx-2">
        <form onSubmit={onSearch} className="flex w-full relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M13.875 12.4554L17.875 16.4602C18.0536 16.6589 18.0448 16.9631 17.855 17.1511L17.155 17.8519C17.0611 17.9467 16.9333 18 16.8 18C16.6667 18 16.5389 17.9467 16.445 17.8519L12.445 13.8471C12.3344 13.7362 12.234 13.6156 12.145 13.4867L11.395 12.4855C10.1541 13.4776 8.613 14.0178 7.025 14.0173C3.75261 14.0287 0.909021 11.7686 0.177731 8.5751C-0.553569 5.38161 1.0226 2.10699 3.9731 0.689912C6.92359 -0.727158 10.461 0.0915127 12.491 2.66125C14.521 5.23099 14.5019 8.866 12.445 11.4142L13.445 12.105C13.6012 12.2051 13.7454 12.3226 13.875 12.4554ZM2.025 7.0089C2.025 9.7736 4.26357 12.0149 7.025 12.0149C8.3511 12.0149 9.6229 11.4875 10.5605 10.5487C11.4982 9.6099 12.025 8.3366 12.025 7.0089C12.025 4.24412 9.7864 2.00285 7.025 2.00285C4.26357 2.00285 2.025 4.24412 2.025 7.0089Z"
              fill="white"
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 rounded-full bg-[rgba(255,255,255,0.1)] text-white border border-white pl-10"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-white">Filter by Date</span>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="py-1 px-3 rounded-full bg-[rgba(255,255,255,0.1)] text-white border border-white"
        >
          {dateFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-white">Filter by Type</span>
        {typeFilterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setTypeFilter(option.id)}
            className={`py-1.5 px-6 rounded-full border ${
              typeFilter === option.id
                ? "!bg-[var(--color-bg-active)] !text-black"
                : "bg-transparent "
            } border-white text-white transition-colors duration-200 hover:bg-[var(--color-bg-hover)] cursor-pointer`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default UploadsFilters;
