import * as ReactHookForm from 'react-hook-form'
console.log('ReactHookForm:', ReactHookForm)
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const typeOptions = [
  { value: 'Direct', label: 'Direct' },
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Consignment', label: 'Consignment' },
] as const

function getEopOptions(type: string) {
  if (type === 'Inventory' || type === 'Consignment') return [
    { value: 'Enter Counted Stock', label: 'Enter Counted Stock' },
    { value: 'Default System', label: 'Default System' },
  ]
  if (type === 'Direct') return [{ value: 'Default Zero', label: 'Default Zero' }]
  return []
}

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Direct', 'Inventory', 'Consignment']),
  eop: z.enum(['Default Zero', 'Enter Counted Stock', 'Default System']),
  deliveryPoint: z.string().min(1, 'Delivery Point is required'),
  department: z.string().min(1, 'Department is required'),
  isActive: z.boolean(),
})

export type LocationFormValues = z.infer<typeof schema>

interface LocationDetailFormProps {
  initialValues?: LocationFormValues
  onSubmit?: (values: LocationFormValues) => void
  onCancel?: () => void
}

function LocationDetailForm({ initialValues, onSubmit, onCancel }: LocationDetailFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {
      code: '',
      name: '',
      type: 'Direct',
      eop: 'Default Zero',
      deliveryPoint: '',
      department: '',
      isActive: true,
    },
  })

  const type = watch('type')

  function submit(values: LocationFormValues) {
    // <COMMENT> Stub: handle submit
    if (onSubmit) onSubmit(values)
    else alert('Submitted: ' + JSON.stringify(values, null, 2))
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Code</label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.code && <span className="text-xs text-destructive">{errors.code.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <span className="text-xs text-destructive">{errors.type.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">EOP</label>
        <Controller
          name="eop"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select EOP" />
              </SelectTrigger>
              <SelectContent>
                {getEopOptions(type).map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.eop && <span className="text-xs text-destructive">{errors.eop.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Delivery Point</label>
        <Controller
          name="deliveryPoint"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.deliveryPoint && <span className="text-xs text-destructive">{errors.deliveryPoint.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <Controller
          name="department"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.department && <span className="text-xs text-destructive">{errors.department.message}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <span>Active</span>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={isSubmitting}>Save</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

export { LocationDetailForm } 