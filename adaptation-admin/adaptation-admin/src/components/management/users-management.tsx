import React, { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash, RefreshCw, Link as LinkIcon } from 'lucide-react'
import { UserDialog } from './user-dialog'
import { ResetPasswordDialog } from './reset-password-dialog'
import { Employee, UserRole } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { toast } from 'sonner'

export function UsersManagement() {
  const { users, deleteUser, resetUserPassword, changeUserRole, generateAccessLink } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openResetDialog, setOpenResetDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null)
  
  const handleAddUser = () => {
    setSelectedUser(null)
    setOpenDialog(true)
  }
  
  const handleEditUser = (user: Employee) => {
    setSelectedUser(user)
    setOpenDialog(true)
  }
  
  const handleDeleteClick = (user: Employee) => {
    setSelectedUser(user)
    setOpenDeleteDialog(true)
  }
  
  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id)
      setOpenDeleteDialog(false)
    }
  }
  
  const handleResetClick = (user: Employee) => {
    setSelectedUser(user)
    setOpenResetDialog(true)
  }
  
  const handleConfirmReset = () => {
    if (selectedUser) {
      resetUserPassword(selectedUser.id)
      setOpenResetDialog(false)
      toast.success('Пароль успешно сброшен')
    }
  }
  
  const handleRoleChange = (userId: string, role: UserRole) => {
    changeUserRole(userId, role)
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Пользователи</h2>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Последний вход</TableHead>
              <TableHead className="w-[200px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Администратор</SelectItem>
                      <SelectItem value="manager">Руководитель</SelectItem>
                      <SelectItem value="observer">Наблюдатель</SelectItem>
                      <SelectItem value="employee">Сотрудник</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {format(new Date(user.createAt), 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  {user.lastLogin ? format(new Date(user.lastLogin), 'dd.MM.yyyy HH:mm', { locale: ru }) : 'Не входил'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleResetClick(user)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)}>
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
        <UserDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog} 
          user={selectedUser}
        />
      )}
      
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит пользователя {selectedUser?.fullName} и не может быть отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedUser && (
        <ResetPasswordDialog
          open={openResetDialog}
          onOpenChange={setOpenResetDialog}
          onConfirm={handleConfirmReset}
          userName={selectedUser.fullName}
        />
      )}
    </div>
  )
} 