import { saveMapping } from '@/app/(main)/pos-operations/mapping/actions/save-mapping'

describe('saveMapping', () => {
  const validMapping = {
    posItem: {
      id: '1',
      name: 'Test Item',
      sku: 'TEST-001',
    },
    components: [
      {
        id: '1',
        name: 'Component 1',
        sku: 'COMP-001',
        unit: 'kg',
        quantity: 1,
        costPerUnit: 10,
      }
    ]
  }

  it('should reject mapping with empty components', async () => {
    const invalidMapping = {
      posItem: {
        id: '1',
        name: 'Test Item',
        sku: 'SKU123'
      },
      components: []
    }
    const result = await saveMapping(invalidMapping)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.components).toBeDefined()
    expect(result.fieldErrors?.components?.[0]).toBe('At least one component is required') 
  })

  it('should reject mapping with invalid component quantity', async () => {
    const invalidMapping = {
      posItem: {
        id: '1',
        name: 'Test Item',
        sku: 'SKU123'
      },
      components: [{
        id: '1',
        name: 'Component 1',
        sku: 'COMP1',
        unit: 'kg',
        quantity: 0,
        costPerUnit: 10
      }]
    }
    const result = await saveMapping(invalidMapping)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.components).toBeDefined()
    expect(result.fieldErrors?.components?.[0]).toBe('Number must be greater than or equal to 0.01')
  })

  it('should reject mapping with missing required fields', async () => {
    const invalidMapping = {
      posItem: {
        id: '1',
        name: '', // Missing name
        sku: 'SKU123'
      },
      components: [{
        id: '1',
        name: 'Component 1',
        sku: 'COMP1',
        unit: 'kg',
        quantity: 1,
        costPerUnit: 10
      }]
    }
    const result = await saveMapping(invalidMapping)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.posItem).toBeDefined()
    expect(result.fieldErrors?.posItem?.[0]).toMatch(/String must contain at least 1 character/)
  })

  it('should successfully save valid mapping', async () => {
    const result = await saveMapping(validMapping)
    expect(result.data).toBeDefined()
    expect(result.data?.name).toBe('Test Item')
    expect(result.data?.status).toBe('mapped')
    expect(result.data?.components).toBe(1)
  })
})