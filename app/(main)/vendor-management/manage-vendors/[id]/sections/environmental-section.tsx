import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Vendor, EnvironmentalImpact } from '../types'

'use client'


type EnvironmentalFieldPath = 
  | `environmentalImpact.${keyof EnvironmentalImpact}`
  | `environmentalImpact.${keyof EnvironmentalImpact}.value`

interface EnvironmentalSectionProps {
  vendor?: Vendor
  isEditing?: boolean
  onFieldChange?: (name: EnvironmentalFieldPath, value: number | string) => void
}

export function EnvironmentalSection({ vendor, isEditing = false, onFieldChange }: EnvironmentalSectionProps) {
  const environmentalData = vendor?.environmentalImpact

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="carbonFootprint">Carbon Footprint (tCO2e)</Label>
          <Input
            id="carbonFootprint"
            name="carbonFootprint"
            type="number"
            value={environmentalData?.carbonFootprint?.value || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.carbonFootprint.value', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full"
            placeholder="Annual carbon emissions"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="energyEfficiency">Energy Efficiency (%)</Label>
          <Input
            id="energyEfficiency"
            name="energyEfficiency"
            type="number"
            value={environmentalData?.energyEfficiency?.value || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.energyEfficiency.value', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full"
            placeholder="Energy efficiency rating"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wasteReduction">Waste Reduction (%)</Label>
          <Input
            id="wasteReduction"
            name="wasteReduction"
            type="number"
            min="0"
            max="100"
            value={environmentalData?.wasteReduction?.value || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.wasteReduction.value', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full"
            placeholder="Annual reduction"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complianceRate">Compliance Rate (%)</Label>
          <Input
            id="complianceRate"
            name="complianceRate"
            type="number"
            min="0"
            max="100"
            value={environmentalData?.complianceRate?.value || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.complianceRate.value', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full"
            placeholder="Compliance rate"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="esgScore">ESG Score</Label>
          <Input
            id="esgScore"
            name="esgScore"
            value={environmentalData?.esgScore || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.esgScore', e.target.value)}
            disabled={!isEditing}
            className="w-full"
            placeholder="ESG Score"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastUpdated">Last Updated</Label>
          <Input
            id="lastUpdated"
            name="lastUpdated"
            type="date"
            value={environmentalData?.lastUpdated || ''}
            onChange={(e) => onFieldChange?.('environmentalImpact.lastUpdated', e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        </div>
      </div>

      {/* Certifications will be handled in a separate section */}
    </div>
  )
} 