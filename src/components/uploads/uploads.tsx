/**
 * Uploads component
 * This component fetches account uploads data from the API and displays them in a grid
 * with filtering and pagination options
 */

import React, { useState, useEffect } from "react";
import "./uploads.css";
import { useRewardAccounts } from "./useRewardAccounts";
import { useUploads, Upload } from "./useUploads";
import UploadsGrid from "./UploadsGrid";
import UploadsList from "./UploadsList";
import UploadsFilters from "./UploadsFilters";
import { useWallet } from "../../context/WalletContext";
import { ExplorerLink } from "../ui/FinishScreen";

interface UploadsProps {
  limit?: number;
}

type ViewMode = "grid" | "list";

const dateFilterOptions = [
  { id: "select", label: "Select" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

const typeFilterOptions = [
  { id: "all", label: "All" },
  { id: "pdf", label: "PDF" },
  { id: "text", label: "Text" },
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPEG/JPG" },
];

const Uploads: React.FC<UploadsProps> = ({ limit = 9 }) => {
  const [dateFilter, setDateFilter] = useState<string>("select");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { defaultWallet } = useWallet();
  const rewardAccounts = useRewardAccounts();
  const {
    allUploads,
    filteredUploads,
    displayedUploads,
    setFilteredUploads,
    setDisplayedUploads,
    loading,
    error,
    pagesData,
    lastObjectUlids,
    currentPage,
    setCurrentPage,
    hasMorePages,
    setAllUploads,
    setPagesData,
    setLastObjectUlids,
    setHasMorePages,
    fetchNextPage,
  } = useUploads({ limit, rewardAccounts });

  // Filtering logic
  useEffect(() => {
    let filtered = [...allUploads];
    // Date filter
    if (dateFilter !== "select") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today); thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(today); thisMonth.setMonth(today.getMonth() - 1);
      const thisYear = new Date(today); thisYear.setFullYear(today.getFullYear() - 1);
      filtered = filtered.filter((upload) => {
        const uploadDate = new Date(upload.dateUploaded);
        switch (dateFilter) {
          case "today": return uploadDate >= today;
          case "week": return uploadDate >= thisWeek;
          case "month": return uploadDate >= thisMonth;
          case "year": return uploadDate >= thisYear;
          default: return true;
        }
      });
    }
    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((upload) => {
        if (!upload.fileType) return false;
        const lowerFileType = upload.fileType.toLowerCase();
        switch (typeFilter) {
          case "pdf": return lowerFileType.includes("pdf");
          case "text": return lowerFileType.includes("text");
          case "png": return lowerFileType.includes("png");
          case "jpeg": return lowerFileType.includes("jpeg") || lowerFileType.includes("jpg");
          default: return true;
        }
      });
    }
    // Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((upload) => (
        (upload.name && upload.name.toLowerCase().includes(query)) ||
        (upload.description && upload.description.toLowerCase().includes(query))
      ));
    }
    setFilteredUploads(filtered);
    setDisplayedUploads(filtered.slice(0, limit));
    setCurrentPage(1);
  }, [allUploads, dateFilter, typeFilter, searchQuery, limit, setFilteredUploads, setDisplayedUploads, setCurrentPage]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); };
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: toast notification
    });
  };

  const loadMore = () => { if (hasMorePages) fetchNextPage(currentPage + 1); };
  const goToPreviousPage = () => { if (currentPage > 1) { setDisplayedUploads(pagesData[currentPage - 1] || []); setCurrentPage(currentPage - 1); } };
  const goToPage = (page: number) => {
    if (page === currentPage) return;
    if (page < currentPage) { setDisplayedUploads(pagesData[page] || []); setCurrentPage(page); }
    else { fetchNextPage(page); }
  };

  if (!defaultWallet) {
    return <div className="uploads-error">Please connect a wallet</div>;
  }

  return (
    <div className="uploads-container">
      <div className="uploads-header">
        <h1>My uploads</h1>
        <UploadsFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          dateFilterOptions={dateFilterOptions}
          typeFilterOptions={typeFilterOptions}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {displayedUploads.length === 0 ? (
        <div className="no-uploads">No uploads found.</div>
      ) : viewMode === "grid" ? (
        <UploadsGrid uploads={displayedUploads} onCopyText={handleCopyText} />
      ) : (
        <UploadsList uploads={displayedUploads} onCopyText={handleCopyText} />
      )}

      {/* Only show pagination if we have uploads to display */}
      {displayedUploads.length > 0 && (
        <div className="pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
            className="pagination-button previous"
          >
            Previous
          </button>

          <div className="page-numbers">
            {currentPage > 2 && (
              <button onClick={() => goToPage(1)} className="page-number">
                1
              </button>
            )}
            {currentPage > 3 && <span className="ellipsis">...</span>}
            {currentPage > 1 && (
              <button
                onClick={() => goToPage(currentPage - 1)}
                className="page-number"
              >
                {currentPage - 1}
              </button>
            )}
            <button className="page-number active">{currentPage}</button>
            {hasMorePages && (
              <button
                onClick={() => goToPage(currentPage + 1)}
                className="page-number"
              >
                {currentPage + 1}
              </button>
            )}
            {hasMorePages && <span className="ellipsis">...</span>}
          </div>

          <button
            onClick={loadMore}
            disabled={!hasMorePages || loading}
            className="pagination-button next"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Uploads;
