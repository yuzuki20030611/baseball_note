import { useState, useCallback } from 'react'

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const filterData = useCallback(
    <T extends Record<string, any>>(data: T[], searchFields: (keyof T)[]) => {
      return data.filter((item) =>
        searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    },
    [searchTerm]
  )

  return { searchTerm, handleSearch, filterData }
}
