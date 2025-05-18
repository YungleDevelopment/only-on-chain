import { useState, useEffect, useCallback } from "react";
import { buildApiUrl, API_KEY } from "../../utils/apiConsumption";

export interface Upload {
  id: string;
  name: string;
  dateUploaded: string;
  description?: string;
  thumbnailUrl?: string;
  fileType?: string;
  objectData?: string;
  objectType?: string;
  indexingTxId?: string;
  indexingTxSubmittedAt?: string;
  shardTxIds?: string[];
  objectUlid?: string;
}

export interface UseUploadsProps {
  limit?: number;
  rewardAccounts: string[];
}

export function useUploads({ limit = 9, rewardAccounts }: UseUploadsProps) {
  const [allUploads, setAllUploads] = useState<Upload[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([]);
  const [displayedUploads, setDisplayedUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagesData, setPagesData] = useState<{ [page: number]: Upload[] }>({});
  const [lastObjectUlids, setLastObjectUlids] = useState<{
    [page: number]: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  useEffect(() => {
    const fetchInitialUploads = async () => {
      try {
        if (rewardAccounts.length === 0) return;
        setLoading(true);
        setError(null);
        const body = { limit, rewardAccounts };
        const response = await fetch(buildApiUrl("/account-uploads"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const formattedUploads: Upload[] = data.objects;
        setAllUploads(formattedUploads);
        setFilteredUploads(formattedUploads);
        setDisplayedUploads(formattedUploads);
        setPagesData({ 1: formattedUploads });
        const lastUlid = data.mLastObjectUlid;
        setLastObjectUlids({ 1: lastUlid });
        setHasMorePages(lastUlid !== null);
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching initial uploads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialUploads();
  }, [rewardAccounts, limit]);

  const fetchNextPage = useCallback(
    async (pageNumber: number) => {
      if (pagesData[pageNumber]) {
        setDisplayedUploads(pagesData[pageNumber]);
        setCurrentPage(pageNumber);
        return;
      }
      const lastUlid = lastObjectUlids[pageNumber - 1];
      if (!lastUlid) return;
      try {
        setLoading(true);
        const body = { lastObjectUlid: lastUlid, limit, rewardAccounts };
        const response = await fetch(buildApiUrl("/account-uploads"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const formattedUploads: Upload[] = data.objects;
        setAllUploads((prev) => [...prev, ...formattedUploads]);
        setPagesData((prev) => ({ ...prev, [pageNumber]: formattedUploads }));
        const newLastUlid = data.mLastObjectUlid;
        setLastObjectUlids((prev) => ({ ...prev, [pageNumber]: newLastUlid }));
        setHasMorePages(newLastUlid !== null);
        setDisplayedUploads(formattedUploads);
        setCurrentPage(pageNumber);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error(`Error fetching page ${pageNumber}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [pagesData, lastObjectUlids, limit, rewardAccounts]
  );

  return {
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
  };
}
