import { useNavigate } from 'react-router-dom'
import { CreateTrackForm } from '@/components/create-track-form'

export function CreateTrackPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <CreateTrackForm onSuccess={() => navigate('/tracks')} />
    </div>
  )
} 