"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

export default function OrderManagementCard() {
  const [location, setLocation] = useState("Warehouse A")
  const [product, setProduct] = useState("office-chair")
  const [orderUnit, setOrderUnit] = useState("Piece")
  const [requestQuantity, setRequestQuantity] = useState("10")

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">
                  <Checkbox />
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Location</th>
                <th className="text-left p-4 font-medium text-gray-600">Product</th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Order Unit /<br />
                  Inv. Unit
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Request / On
                  <br />
                  Order
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Approve / On
                  <br />
                  Hand
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Currency /<br />
                  Base
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Price / Last
                  <br />
                  Price
                </th>
                <th className="text-center p-4 font-medium text-gray-600">Total</th>
                <th className="text-center p-4 font-medium text-gray-600">Status</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Checkbox />
                </td>
                <td className="p-4">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      <SelectItem value="Warehouse C">Warehouse C</SelectItem>
                      <SelectItem value="Main Storage">Main Storage</SelectItem>
                      <SelectItem value="Distribution Center">Distribution Center</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office-chair">
                        <div>
                          <div className="font-medium">Office Chair</div>
                          <div className="text-sm text-gray-500">Ergonomic office chair wit...</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="desk-lamp">
                        <div>
                          <div className="font-medium">Desk Lamp</div>
                          <div className="text-sm text-gray-500">LED adjustable desk lamp</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="monitor-stand">
                        <div>
                          <div className="font-medium">Monitor Stand</div>
                          <div className="text-sm text-gray-500">Adjustable monitor stand</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="keyboard">
                        <div>
                          <div className="font-medium">Wireless Keyboard</div>
                          <div className="text-sm text-gray-500">Bluetooth mechanical keyboard</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-center">
                  <Select value={orderUnit} onValueChange={setOrderUnit}>
                    <SelectTrigger className="w-20 mx-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Carton">Carton</SelectItem>
                      <SelectItem value="Pallet">Pallet</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-500 mt-1">Piece</div>
                </td>
                <td className="p-4 text-center">
                  <Input
                    type="number"
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(e.target.value)}
                    className="w-16 mx-auto text-center"
                    min="1"
                  />
                  <div className="text-sm text-gray-500 mt-1">15</div>
                </td>
                <td className="p-4 text-center">
                  <div className="font-medium">8</div>
                  <div className="text-sm text-gray-500">5</div>
                </td>
                <td className="p-4 text-center">
                  <div className="font-medium">USD</div>
                  <div className="text-sm text-gray-500">USD</div>
                </td>
                <td className="p-4 text-center">
                  <div className="font-medium">199.99</div>
                  <div className="text-sm text-gray-500">199.99</div>
                </td>
                <td className="p-4 text-center">
                  <div className="font-medium">
                    {(Number.parseFloat(requestQuantity) * 199.99).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">1,599.92</div>
                </td>
                <td className="p-4 text-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
