import { useState } from 'react'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UpdateTrackDialogProps {
  employeeId: string
  open: boolean
  onClose: () => void
}

export function UpdateTrackDialog({ employeeId, open, onClose }: UpdateTrackDialogProps) {
  const { employees, tracks, updateTrack } = useStore()
  const employee = employees.find((e) => e.id === employeeId)
  const [selectedTrackId, setSelectedTrackId] = useState(employee?.assignedTrackId || '')
  const [startDate, setStartDate] = useState(employee?.startDate || '')

  const handleUpdate = () => {
    if (selectedTrackId && startDate) {
      updateTrack(employeeId, selectedTrackId, startDate)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Track</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="track">Select Track</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!selectedTrackId || !startDate}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 