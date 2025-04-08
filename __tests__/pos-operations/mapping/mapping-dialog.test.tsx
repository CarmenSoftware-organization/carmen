import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MappingDialog } from '@/app/(main)/pos-operations/mapping/components/mapping-dialog'
import { MappingItem } from '@/app/(main)/pos-operations/mapping/store/mapping-store'

describe('MappingDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()
  const mockInitialData: MappingItem = {
    id: 'test-id',
    name: 'Test Item',
    sku: 'TEST-001',
    lastSale: '2024-03-15',
    saleFrequency: 'High',
    status: 'mapped',
    lastUpdated: '2024-03-15T00:00:00Z',
    components: [
      {
        id: 'comp-1',
        name: 'Component 1',
        sku: 'COMP-001',
        unit: 'g',
        quantity: 100,
        costPerUnit: 1.5,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog with initial data', () => {
    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={mockInitialData}
        description="Edit recipe mapping details"
      />
    )

    expect(screen.getByText('Edit Recipe Mapping')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument()
    expect(screen.getByDisplayValue('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('Component 1')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        description="Create new recipe mapping"
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Mapping' })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const errorMessages = screen.getAllByText('String must contain at least 1 character(s)')
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  })

  it('should handle component addition and removal', async () => {
    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={mockInitialData}
        description="Edit recipe mapping details"
      />
    )

    // Remove existing component
    const removeButton = screen.getByRole('button', { name: 'Remove' })
    await userEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText(/no components added yet/i)).toBeInTheDocument()
    })

    // Add component button should be visible
    expect(screen.getByRole('button', { name: 'Add Component' })).toBeInTheDocument()
  })

  it('should update component quantity', async () => {
    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    )

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i }) as HTMLInputElement
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '200')

    expect(quantityInput).toHaveValue(200)
  })

  it('should handle successful form submission', async () => {
    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={mockInitialData}
        description="Edit recipe mapping details"
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Mapping' })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        id: mockInitialData.id,
        name: mockInitialData.name,
        sku: mockInitialData.sku,
        status: 'mapped',
        components: mockInitialData.components,
      }))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show loading state during submission', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <MappingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={mockInitialData}
        description="Edit recipe mapping details"
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Mapping' })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })
}) 