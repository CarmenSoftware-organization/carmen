import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { users, departments, storeLocations } from '@/lib/mockData'

interface NewCountFormProps {
  onClose: () => void;
  onSubmit: (data: NewCountData) => void;
}

export interface NewCountData {
  counter: string;
  department: string;
  storeName: string;
  date: string;
  notes: string;
}

export function NewCountForm({ onClose, onSubmit }: NewCountFormProps) {
  const [formData, setFormData] = useState<NewCountData>({
    counter: '',
    department: '',
    storeName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (name: keyof NewCountData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-lg mx-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">New Count</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counter">Counter</Label>
              <Select value={formData.counter} onValueChange={(value) => handleChange('counter', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Counter" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Location</Label>
              <Select value={formData.storeName} onValueChange={(value) => handleChange('storeName', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {storeLocations.map(location => (
                    <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full h-24 p-2 border rounded-md"
                placeholder="Enter any additional notes here..."
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Create Count</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

