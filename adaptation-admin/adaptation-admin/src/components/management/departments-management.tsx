import React, { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash } from 'lucide-react'
import { Department } from '@/types'
import { DictionaryDialog } from './dictionary-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function DepartmentsManagement() {
  const { departments, deleteDepartment } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  const handleAddDepartment = () => {
    setSelectedDepartment(null)
    setOpenDialog(true)
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setOpenDialog(true)
  }

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department)
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id)
      setOpenDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Подразделения</h2>
        <Button onClick={handleAddDepartment}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить подразделение
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map(department => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{department.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditDepartment(department)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(department)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {openDialog && (
        <DictionaryDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          item={selectedDepartment}
          type="department"
        />
      )}

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит подразделение "{selectedDepartment?.name}" и не может быть отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 