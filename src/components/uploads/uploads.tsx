/**
 * Uploads component
 * This component fetches account uploads data from the API and displays them in a grid
 * with filtering and pagination options
 */

import React, { useState, useEffect } from "react";
import { useRewardAccounts } from "./useRewardAccounts";
import { useUploads, Upload } from "./useUploads";
import UploadsGrid from "./UploadsGrid";
import UploadsList from "./UploadsList";
import UploadsFilters from "./UploadsFilters";
import { useWallet } from "../../context/WalletContext";
import { ExplorerLink } from "../ui/FinishScreen";
import { mockUploads } from "./mockData";
import GradientText from "./GradientText";

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

// Importar el tipo DateRange de react-day-picker para mantener compatibilidad
import { DateRange } from "react-day-picker";

const Uploads: React.FC<UploadsProps> = ({ limit = 9 }) => {
  const [dateFilter, setDateFilter] = useState<string>("select");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
  // Use mockData cuando no hay datos reales
  // useEffect(() => {
  //   if (allUploads.length === 0 && !loading) {
  //     setAllUploads(mockUploads);
  //   }
  // }, [allUploads.length, loading, setAllUploads]);

  useEffect(() => {
    let filtered = [...allUploads];
    // Filtro por rango de fechas
    if (dateRange && dateRange.from && dateRange.to) {
      console.log("Aplicando filtro por rango de fechas:", {
        desde: dateRange.from.toISOString(),
        hasta: dateRange.to.toISOString(),
      });

      // Si tenemos un rango seleccionado, filtramos por ese rango
      filtered = filtered.filter((upload) => {
        // Verificar que el upload tiene fecha
        if (!upload.dateUploaded) return false;

        const uploadDate = new Date(upload.dateUploaded);
        console.log(
          `Evaluando upload: ${upload.name}, fecha: ${uploadDate.toISOString()}`
        );

        // Usar aserciones de tipo para evitar errores de TypeScript
        const fromDate = dateRange.from as Date;
        const toDate = dateRange.to as Date;

        // Ajustar el final del día para to (hasta las 23:59:59)
        const endDate = new Date(toDate.getTime());
        endDate.setHours(23, 59, 59, 999);

        // Verificar si la fecha está dentro del rango seleccionado
        const isInRange = uploadDate >= fromDate && uploadDate <= endDate;
        console.log(`  ${upload.name} está en rango: ${isInRange}`);
        return isInRange;
      });

      console.log(
        `Resultados filtrados: ${filtered.length} de ${allUploads.length}`
      );
    }
    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((upload) => {
        if (!upload.fileType) return false;
        const lowerFileType = upload.fileType.toLowerCase();
        switch (typeFilter) {
          case "pdf":
            return lowerFileType.includes("pdf");
          case "text":
            return lowerFileType.includes("text");
          case "png":
            return lowerFileType.includes("png");
          case "jpeg":
            return (
              lowerFileType.includes("jpeg") || lowerFileType.includes("jpg")
            );
          default:
            return true;
        }
      });
    }
    // Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (upload) =>
          (upload.name && upload.name.toLowerCase().includes(query)) ||
          (upload.description &&
            upload.description.toLowerCase().includes(query))
      );
    }
    setFilteredUploads(filtered);
    // Reset pagination when filters change
    setCurrentPage(1);
    setPagesData({});
    setDisplayedUploads(filtered.slice(0, limit));
    setLastObjectUlids({});
    setHasMorePages(filtered.length > limit);

    // Depurar cantidad de elementos filtrados
    console.log(
      `Total de elementos después de todos los filtros: ${filtered.length}`
    );
  }, [
    allUploads,
    dateFilter,
    typeFilter,
    searchQuery,
    dateRange,
    limit,
    setFilteredUploads,
    setCurrentPage,
    setPagesData,
    setDisplayedUploads,
    setLastObjectUlids,
    setHasMorePages,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: toast notification
    });
  };

  const loadMore = () => {
    if (hasMorePages) fetchNextPage(currentPage + 1);
  };

  // Get paginated data for current page
  const getPageData = (page: number, pageLimit: number) => {
    const startIndex = (page - 1) * pageLimit;
    return filteredUploads.slice(startIndex, startIndex + pageLimit);
  };

  // Get next page of uploads
  const goToNextPage = () => {
    if (hasMorePages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  // Generate array of page numbers to display in pagination
  const getPageNumbers = () => {
    const totalPages = Math.ceil(filteredUploads.length / limit);
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 5) {
      // If we have 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage <= 3) {
        // Near the beginning; show first 4 pages, then ellipsis, then last page
        pageNumbers.push(2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end; show first page, ellipsis, then last 4 pages
        pageNumbers.push(
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        // In the middle; show first page, ellipsis, current page and neighbors, ellipsis, last page
        pageNumbers.push(
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pageNumbers;
  };

  // Pagination logic - update displayed uploads when page changes
  useEffect(() => {
    if (filteredUploads.length > 0) {
      // Get uploads for the current page
      setDisplayedUploads(getPageData(currentPage, limit));
      // Calculate if there are more pages available
      const totalPages = Math.ceil(filteredUploads.length / limit);
      setHasMorePages(currentPage < totalPages);
    } else {
      setDisplayedUploads([]);
      setHasMorePages(false);
    }
  }, [filteredUploads, currentPage, limit]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
  };

  if (!defaultWallet) {
    return <div className="uploads-error">Please connect a wallet</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-5 text-black bg-[var(--color-bg-dark)] min-h-screen">
      <h1 className="text-7xl font-bold text-center my-8">
        <GradientText text="My uploads" />
      </h1>
      <div className="mb-8">
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
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)] text-lg">
          Loading uploads...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)] text-lg">
          Error loading uploads. Using mock data instead.
        </div>
      ) : displayedUploads.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)] text-lg">
          No uploads found.
        </div>
      ) : viewMode === "grid" ? (
        <UploadsGrid uploads={displayedUploads} onCopyText={handleCopyText} />
      ) : (
        <UploadsList uploads={displayedUploads} onCopyText={handleCopyText} />
      )}

      {/* Only show pagination if we have uploads to display */}
      {displayedUploads.length > 0 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
            className="bg-[rgba(255,255,255,0.1)] border border-white cursor-pointer text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(255,255,255,0.3)]"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  className={`w-14 h-10 flex items-center justify-center rounded-full border-2 ${
                    page === currentPage
                      ? "bg-white text-black border-white"
                      : "text-white border-white hover:border-white hover:bg-[rgba(255,255,255,0.3)]"
                  } font-medium cursor-pointer transition-all duration-200`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="text-gray-400 mx-1">
                  {page}
                </span>
              )
            )}
          </div>

          <button
            onClick={goToNextPage}
            disabled={!hasMorePages || loading}
            className="bg-[rgba(255,255,255,0.1)] border border-white cursor-pointer text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(255,255,255,0.3)]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Uploads;
