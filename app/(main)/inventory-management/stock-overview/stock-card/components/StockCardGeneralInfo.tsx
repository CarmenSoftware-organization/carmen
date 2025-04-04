import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, BarChart2, Calendar, Info, Tag } from "lucide-react"
import { StockCardData } from "../../types"
import { formatCurrency, formatDate, formatNumber } from "../../inventory-balance/utils"

interface StockCardGeneralInfoProps {
  data: StockCardData
}

export function StockCardGeneralInfo({ data }: StockCardGeneralInfoProps) {
  const { product, summary, locationStocks } = data
  
  return (
    <div className="space-y-6">
      {/* Product Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Product Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Product Code</p>
              <p className="font-medium">{product.code}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="font-medium">{product.description}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Barcode</p>
              <p className="font-medium">{product.barcode || "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Primary Unit</p>
              <p className="font-medium">{product.unit}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Alternate Unit</p>
              <p className="font-medium">
                {product.alternateUnit 
                  ? `${product.alternateUnit} (1 ${product.alternateUnit} = ${product.conversionFactor} ${product.unit})` 
                  : "N/A"}
              </p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{product.createdBy}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Created Date</p>
              <p className="font-medium">{product.createdAt}</p>
            </div>
          </div>
          
          {product.tags && product.tags.length > 0 && (
            <div className="pt-2">
              <p className="text-muted-foreground text-sm mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Inventory Parameters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Inventory Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Minimum Stock</p>
              <p className="font-medium">{product.minimumStock ? formatNumber(product.minimumStock) : "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Maximum Stock</p>
              <p className="font-medium">{product.maximumStock ? formatNumber(product.maximumStock) : "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Reorder Point</p>
              <p className="font-medium">{product.reorderPoint ? formatNumber(product.reorderPoint) : "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Reorder Quantity</p>
              <p className="font-medium">{product.reorderQuantity ? formatNumber(product.reorderQuantity) : "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Lead Time</p>
              <p className="font-medium">{product.leadTime ? `${product.leadTime} days` : "N/A"}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Shelf Life</p>
              <p className="font-medium">{product.shelfLife ? `${product.shelfLife} days` : "N/A"}</p>
            </div>
          </div>
          
          {product.storageRequirements && (
            <div className="pt-2">
              <p className="text-muted-foreground text-sm">Storage Requirements</p>
              <div className="flex items-center gap-2 mt-1">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="font-medium text-sm">{product.storageRequirements}</p>
              </div>
            </div>
          )}
          
          {/* Stock Status Indicators */}
          <div className="pt-2">
            <p className="text-muted-foreground text-sm mb-2">Stock Status</p>
            <div className="flex flex-wrap gap-3">
              {summary.currentStock <= (product.minimumStock || 0) && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Below minimum stock level</span>
                </div>
              )}
              
              {summary.currentStock <= (product.reorderPoint || 0) && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Info className="h-4 w-4" />
                  <span>Reorder point reached</span>
                </div>
              )}
              
              {summary.currentStock >= (product.maximumStock || 0) && (
                <div className="flex items-center gap-2 text-purple-600 text-sm">
                  <BarChart2 className="h-4 w-4" />
                  <span>Maximum stock level exceeded</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Location Stock */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Location Stock</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Location</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Value</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Last Movement</th>
                </tr>
              </thead>
              <tbody>
                {locationStocks.map((location) => (
                  <tr key={location.locationId} className="border-b">
                    <td className="py-3">{location.locationName}</td>
                    <td className="py-3 text-right">{formatNumber(location.quantity)} {product.unit}</td>
                    <td className="py-3 text-right">{formatCurrency(location.value)}</td>
                    <td className="py-3 text-right">{location.lastMovementDate}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50/50">
                  <td className="py-3 font-medium">Total</td>
                  <td className="py-3 text-right font-medium">{formatNumber(summary.currentStock)} {product.unit}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(summary.currentValue)}</td>
                  <td className="py-3 text-right"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 