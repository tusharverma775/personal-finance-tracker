import { useState, useCallback } from "react";

export default function usePagination(defaultPerPage = 20) {
  const [page, setPage] = useState(1);
  const [perPage] = useState(defaultPerPage);
  const setNext = useCallback(() => setPage(p => p+1), []);
  const setPrev = useCallback(() => setPage(p => Math.max(1, p-1)), []);
  return { page, perPage, setNext, setPrev, setPage };
}
