/**
 * Unit tests for Simplified Policy Creator component
 * Tests the 3-step wizard: template selection → configuration → review
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimplifiedPolicyCreator } from '../simplified-policy-creator'
import { roleBasedTemplates } from '@/lib/mock-data/role-based-policies'

// Mock the role-based templates
vi.mock('@/lib/mock-data/role-based-policies', () => ({
  roleBasedTemplates: [
    {
      id: 'department-role',
      title: 'Department Role Access',
      description: 'Grant a role access to specific department operations',
      icon: 'Building',
      category: 'Department Access',
      complexity: 'simple',
      estimatedTime: '2-3 minutes',
      defaultConfig: {
        roleId: '',
        roleName: '',
        departments: [],
        permissions: ['view_data', 'create_items'],
        approvalLimit: 1000
      }
    },
    {
      id: 'financial-approver',
      title: 'Financial Approver Role',
      description: 'Set up financial approval limits for a role',
      icon: 'DollarSign',
      category: 'Financial Control',
      complexity: 'simple',
      estimatedTime: '3-4 minutes',
      defaultConfig: {
        roleId: '',
        roleName: '',
        maxApprovalAmount: 5000,
        requiresSecondApproval: false,
        transactionTypes: ['purchase-orders', 'vendor-payments']
      }
    }
  ]
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Building: () => <div data-testid="building-icon">Building</div>,
  DollarSign: () => <div data-testid="dollar-icon">DollarSign</div>,
  ArrowLeft: () => <div data-testid="arrow-left">ArrowLeft</div>,
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 {...props}>{children}</h3>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  )
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-variant={variant} {...props}>{children}</span>
  )
}))

describe('SimplifiedPolicyCreator', () => {
  const mockOnPolicyCreate = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onPolicyCreate: mockOnPolicyCreate,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Template Selection Step', () => {
    it('renders template selection step by default', () => {
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      expect(screen.getByText('Choose a Policy Template')).toBeInTheDocument()
      expect(screen.getByText('Select a template to get started quickly')).toBeInTheDocument()
    })

    it('displays all available templates', () => {
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      expect(screen.getByText('Department Role Access')).toBeInTheDocument()
      expect(screen.getByText('Financial Approver Role')).toBeInTheDocument()
      expect(screen.getByText('Department Access')).toBeInTheDocument()
      expect(screen.getByText('Financial Control')).toBeInTheDocument()
    })

    it('shows template details correctly', () => {
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      expect(screen.getByText('Grant a role access to specific department operations')).toBeInTheDocument()
      expect(screen.getByText('Set up financial approval limits for a role')).toBeInTheDocument()
      expect(screen.getByText('2-3 minutes')).toBeInTheDocument()
      expect(screen.getByText('3-4 minutes')).toBeInTheDocument()
    })

    it('allows template selection', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      expect(departmentTemplate.closest('div')).toHaveClass('ring-2')
    })

    it('shows next button when template is selected', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toBeEnabled()
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Configuration Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Select a template and proceed to configuration
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
    })

    it('renders configuration step after template selection', () => {
      expect(screen.getByText('Configure Policy')).toBeInTheDocument()
      expect(screen.getByText('Configure your Department Role Access policy')).toBeInTheDocument()
    })

    it('shows form fields based on template configuration', () => {
      expect(screen.getByLabelText('Role ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Role Name')).toBeInTheDocument()
      expect(screen.getByText('Departments')).toBeInTheDocument()
      expect(screen.getByText('Permissions')).toBeInTheDocument()
      expect(screen.getByLabelText('Approval Limit')).toBeInTheDocument()
    })

    it('allows form input', async () => {
      const user = userEvent.setup()
      
      const roleIdInput = screen.getByLabelText('Role ID')
      const roleNameInput = screen.getByLabelText('Role Name')
      
      await user.type(roleIdInput, 'test-role')
      await user.type(roleNameInput, 'Test Role')
      
      expect(roleIdInput).toHaveValue('test-role')
      expect(roleNameInput).toHaveValue('Test Role')
    })

    it('shows back button to return to template selection', async () => {
      const user = userEvent.setup()
      
      const backButton = screen.getByText('Back')
      await user.click(backButton)
      
      expect(screen.getByText('Choose a Policy Template')).toBeInTheDocument()
    })
  })

  describe('Review Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Navigate to review step
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      // Fill in required fields
      const roleIdInput = screen.getByLabelText('Role ID')
      const roleNameInput = screen.getByLabelText('Role Name')
      await user.type(roleIdInput, 'test-role')
      await user.type(roleNameInput, 'Test Role')
      
      const reviewButton = screen.getByText('Review Policy')
      await user.click(reviewButton)
    })

    it('renders review step after configuration', () => {
      expect(screen.getByText('Review Policy')).toBeInTheDocument()
      expect(screen.getByText('Review your policy configuration before creating')).toBeInTheDocument()
    })

    it('displays configured policy details', () => {
      expect(screen.getByText('test-role')).toBeInTheDocument()
      expect(screen.getByText('Test Role')).toBeInTheDocument()
      expect(screen.getByText('Department Role Access')).toBeInTheDocument()
    })

    it('shows create policy button', () => {
      const createButton = screen.getByText('Create Policy')
      expect(createButton).toBeInTheDocument()
      expect(createButton).toBeEnabled()
    })

    it('calls onPolicyCreate when create button is clicked', async () => {
      const user = userEvent.setup()
      
      const createButton = screen.getByText('Create Policy')
      await user.click(createButton)
      
      expect(mockOnPolicyCreate).toHaveBeenCalledTimes(1)
      expect(mockOnPolicyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Test Role'),
          template: 'department-role'
        })
      )
    })

    it('allows going back to configuration step', async () => {
      const user = userEvent.setup()
      
      const backButton = screen.getByText('Back')
      await user.click(backButton)
      
      expect(screen.getByText('Configure Policy')).toBeInTheDocument()
    })
  })

  describe('Navigation and State Management', () => {
    it('maintains selected template when navigating between steps', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Select financial template
      const financialTemplate = screen.getByText('Financial Approver Role')
      await user.click(financialTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      // Go back and verify template is still selected
      const backButton = screen.getByText('Back')
      await user.click(backButton)
      
      expect(financialTemplate.closest('div')).toHaveClass('ring-2')
    })

    it('preserves form data when navigating back from review', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Navigate to configuration
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      // Fill form
      const roleIdInput = screen.getByLabelText('Role ID')
      const roleNameInput = screen.getByLabelText('Role Name')
      await user.type(roleIdInput, 'test-role')
      await user.type(roleNameInput, 'Test Role')
      
      // Go to review and back
      const reviewButton = screen.getByText('Review Policy')
      await user.click(reviewButton)
      
      const backButton = screen.getByText('Back')
      await user.click(backButton)
      
      // Verify data is preserved
      expect(screen.getByLabelText('Role ID')).toHaveValue('test-role')
      expect(screen.getByLabelText('Role Name')).toHaveValue('Test Role')
    })
  })

  describe('Form Validation', () => {
    it('prevents proceeding to review without required fields', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Select template and go to configuration
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      // Try to proceed without filling required fields
      const reviewButton = screen.getByText('Review Policy')
      expect(reviewButton).toBeDisabled()
    })

    it('enables review button when required fields are filled', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      // Navigate and fill form
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      const roleIdInput = screen.getByLabelText('Role ID')
      const roleNameInput = screen.getByLabelText('Role Name')
      await user.type(roleIdInput, 'test-role')
      await user.type(roleNameInput, 'Test Role')
      
      const reviewButton = screen.getByText('Review Policy')
      expect(reviewButton).toBeEnabled()
    })
  })

  describe('Error Handling', () => {
    it('handles missing template gracefully', () => {
      // Mock empty templates
      vi.mocked(roleBasedTemplates).length = 0
      
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      expect(screen.getByText('Choose a Policy Template')).toBeInTheDocument()
      // Should not crash when no templates available
    })

    it('validates role ID format', async () => {
      const user = userEvent.setup()
      render(<SimplifiedPolicyCreator {...defaultProps} />)
      
      const departmentTemplate = screen.getByText('Department Role Access')
      await user.click(departmentTemplate)
      
      const nextButton = screen.getByText('Configure Policy')
      await user.click(nextButton)
      
      const roleIdInput = screen.getByLabelText('Role ID')
      await user.type(roleIdInput, 'Invalid Role ID!')
      
      // Should show validation error or prevent submission
      const reviewButton = screen.getByText('Review Policy')
      // Button should remain disabled due to invalid input
      expect(reviewButton).toBeDisabled()
    })
  })
})