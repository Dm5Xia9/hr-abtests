import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface RemoveTrackDialogProps {
  employeeId: string
  open: boolean
  onClose: () => void
}

export function RemoveTrackDialog({ employeeId, open, onClose }: RemoveTrackDialogProps) {
  const { employees, removeTrack } = useStore()
  const employee = employees.find((e) => e.id === employeeId)

  const handleRemove = () => {
    removeTrack(employeeId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Track</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the track from {employee?.fullName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 