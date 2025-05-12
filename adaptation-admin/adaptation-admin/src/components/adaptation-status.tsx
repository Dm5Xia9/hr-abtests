import { AdaptationStatus as Status } from '@/types'

interface AdaptationStatusProps {
  status: Status
}

export function AdaptationStatus({ status }: AdaptationStatusProps) {
  const getStatusStyles = (status: Status) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'not_started':
        return 'Без трека адаптации'
      case 'in_progress':
        return 'В процессе'
      case 'completed':
        return 'Завершено'
      default:
        return 'Unknown'
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyles(
        status
      )}`}
    >
      {getStatusText(status)}
    </span>
  )
} 