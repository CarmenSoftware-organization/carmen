// File: PRForm.tsx
import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PurchaseRequest, PRType } from '@/types/types'
import { FileIcon, CalendarIcon, BriefcaseIcon, DollarSignIcon } from 'lucide-react'

interface PRFormProps {
  formData: PurchaseRequest
  setFormData: React.Dispatch<React.SetStateAction<PurchaseRequest>>
  isDisabled: boolean
}

export const PRForm: React.FC<PRFormProps> = ({ formData, setFormData, isDisabled }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof PurchaseRequest) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {[
          { id: 'refNumber', label: 'Reference Number', icon: FileIcon },
          { id: 'date', label: 'Date', icon: CalendarIcon, type: 'date' },
          { id: 'type', label: 'PR Type', icon: BriefcaseIcon, isSelect: true },
          { id: 'estimatedTotal', label: 'Estimated Total', icon: DollarSignIcon, type: 'number' }
        ].map(({ id, label, icon: Icon, type, isSelect }) => (
          <div key={id} className="space-y-1">
            <Label htmlFor={id} className="text-[0.7rem] text-gray-500 flex items-center gap-2">
              <Icon className="h-3 w-3" /> {label}
            </Label>
            {isSelect ? (
              <Select
                disabled={isDisabled}
                value={formData[id as keyof PurchaseRequest] as string}
                onValueChange={handleSelectChange(id as keyof PurchaseRequest)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PRType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={id}
                name={id}
                type={type || 'text'}
                value={formData[id as keyof PurchaseRequest] as string}
                onChange={handleInputChange}
                disabled={isDisabled}
              />
            )}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description" className="text-[0.7rem] text-gray-500 flex items-center gap-2">
          <FileIcon className="h-3 w-3" /> Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          disabled={isDisabled}
          className="h-20"
        />
      </div>
    </>
  )
}
