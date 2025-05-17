import { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { PageTitle } from '@/components/page-title'
import { EmployeesList } from '@/components/employees-list'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmployeesPage() {
  const { fetchEmployees, fetchUsers, fetchTracks, fetchPositions, fetchDepartments } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([
          fetchEmployees(),
          fetchUsers(),
          fetchTracks(),
          fetchPositions(),
          fetchDepartments()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchEmployees, fetchUsers, fetchTracks, fetchPositions, fetchDepartments])

  return (
    <div className="container mx-auto px-4 py-6">

      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <EmployeesList />
      )}
    </div>
  )
} 