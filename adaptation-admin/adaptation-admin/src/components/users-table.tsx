import { useState } from 'react'
import { useStore } from '@/store/index'
import { User, UserRole } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Key, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Руководитель',
  observer: 'Наблюдатель',
  employee: 'Сотрудник',
}

export function UsersTable() {
  const { users } = useStore()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleResetPassword = (user: User) => {
    // Здесь будет логика сброса пароля
    console.log('Reset password for:', user.email)
  }

  const handleChangeRole = (user: User, newRole: UserRole) => {
    // Здесь будет логика изменения роли
    console.log('Change role for:', user.email, 'to:', newRole)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Подразделение</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.position}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{ROLE_LABELS[user.role]}</TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'd MMM yyyy', { locale: ru })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                      <Key className="mr-2 h-4 w-4" />
                      Сбросить пароль
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole(user, 'admin')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Сделать администратором
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole(user, 'manager')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Сделать руководителем
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole(user, 'observer')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Сделать наблюдателем
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 