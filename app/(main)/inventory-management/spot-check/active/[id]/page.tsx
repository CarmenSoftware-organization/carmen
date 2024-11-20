"use client"

import { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Save,
  Clock,
  Layers,
  Eye,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  PauseCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageProps {
  params: {
    id: string
  }
}

export default function ActiveCountPage({ params }: PageProps) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample data structure
  const countSession = {
    id: params.id,
    counter: "John Doe",
    department: "F&B",
    startTime: "2024-04-20 09:00 AM",
    locations: ["Main Kitchen", "Dry Store"],
    status: "in-progress",
    totalItems: 45,
    completedItems: 12
  };

  const CountHeader = () => (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">Active Count: {countSession.id}</h1>
            <p className="text-sm text-gray-500">
              Started: {countSession.startTime} | Counter: {countSession.counter}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <PauseCircle className="h-4 w-4" />
              Pause
            </Button>
            <Button variant="default" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Count
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Duration: 45m</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Progress: {countSession.completedItems}/{countSession.totalItems} items</span>
          </div>
        </div>
      </div>
    </div>
  );

  const LocationBar = () => (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex space-x-4">
          {countSession.locations.map((loc, index) => (
            <div 
              key={loc}
              className={`px-4 py-2 rounded-lg ${
                index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-white border'
              }`}
            >
              {loc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CountInterface = () => (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Location: Main Kitchen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Item {i}</h3>
                      <p className="text-sm text-muted-foreground">SKU-00{i}</p>
                    </div>
                    <Badge variant="secondary">
                      System: 150
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Count</Label>
                      <Input type="number" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button>
                      Save Count
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Count Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(countSession.completedItems/countSession.totalItems) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{countSession.completedItems}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">
                    {countSession.totalItems - countSession.completedItems}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Count Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span>Matches</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                <span>Variances</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                <span>Pending</span>
                <span className="font-medium">33</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountHeader />
      <LocationBar />
      <div className="max-w-7xl mx-auto">
        <CountInterface />
      </div>
    </div>
  );
} 