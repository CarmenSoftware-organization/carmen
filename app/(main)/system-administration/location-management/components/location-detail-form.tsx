import * as ReactHookForm from 'react-hook-form'
console.log('ReactHookForm:', ReactHookForm)
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const typeOptions = [
  { value: 'Direct', label: 'Direct' },
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Consignment', label: 'Consignment' },
] as const

const eopOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
] as const

const schema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  type: z.enum(['Direct', 'Inventory', 'Consignment']),
  eop: z.string(),
  deliveryPoint: z.string().min(1, 'Delivery Point is required').max(50, 'Delivery Point must be 50 characters or less'),
  isActive: z.boolean(),
})

type LocationFormValues = z.infer<typeof schema>

interface LocationDetailFormProps {
  initialValues?: Partial<LocationFormValues>
  onSubmit: (data: LocationFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LocationDetailForm({ initialValues, onSubmit, onCancel, isLoading }: LocationDetailFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {
      code: '',
      name: '',
      type: 'Direct',
      eop: 'true',
      deliveryPoint: '',
      isActive: true,
    },
  })

  const isFormLoading = isSubmitting || isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Code *</label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter location code"
              disabled={isFormLoading}
            />
          )}
        />
        {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter location name"
              disabled={isFormLoading}
            />
          )}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type *</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isFormLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Physical Count (Required)</label>
        <Controller
          name="eop"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isFormLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Physical Count" />
              </SelectTrigger>
              <SelectContent>
                {eopOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.eop && <p className="text-sm text-red-600 mt-1">{errors.eop.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Delivery Point *</label>
        <Controller
          name="deliveryPoint"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter delivery point"
              disabled={isFormLoading}
            />
          )}
        />
        {errors.deliveryPoint && <p className="text-sm text-red-600 mt-1">{errors.deliveryPoint.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isActive"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isFormLoading}
            />
          )}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isFormLoading}
          className="flex items-center gap-2"
        >
          {isFormLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isFormLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 