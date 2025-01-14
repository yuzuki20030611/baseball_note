import { useState } from 'react'

export const usePagination = (initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(initialPageSize)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const getPaginatedData = <T>(data: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize
    return data.slice(startIndex, startIndex + pageSize)
  }

  const getTotalPages = (dataLength: number): number => Math.ceil(dataLength / pageSize)

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
    getTotalPages,
  }
}
