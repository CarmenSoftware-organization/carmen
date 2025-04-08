'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long lists
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion'; // For nice entry animation
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data import (we need mapped items for simulation)
import { mockMappedItems } from '@/app/data/mock-items'; 

// 1. Define Consumption Event Structure
interface ConsumedComponent {
    name: string;
    quantityDeducted: number;
    unit: string;
}

interface ConsumptionEvent {
    id: string; // Unique ID for the event
    timestamp: Date;
    posItemName: string;
    posItemId: string;
    quantitySold: number;
    components: ConsumedComponent[];
}

// Interface for Daily Summary Data
interface DailySummaryData {
    date: Date;
    totalTransactions: number;
    totalSalesValue: number; // Example value
    topConsumedItems: ConsumedComponent[];
}

const MAX_EVENTS = 50; // Max number of events to keep in the list
const UPDATE_INTERVAL = 3000; // Update every 3 seconds (adjust as needed)

// Simulate fetching summary data
async function fetchDailySummary(date: Date): Promise<DailySummaryData> {
    console.log(`Simulating fetch for daily summary for: ${format(date, 'PPP')}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Generate mock summary data based somewhat on the date
    const dayOfMonth = date.getDate();
    const totalTransactions = 50 + Math.floor(Math.random() * dayOfMonth * 5);
    const totalSalesValue = totalTransactions * (15 + Math.random() * 10);
    
    // Select a few random components as top consumed
    const topItems: ConsumedComponent[] = [];
    const numTopItems = Math.min(mockMappedItems.length > 0 ? 3 : 0, mockMappedItems.reduce((acc, item) => acc + (item.components?.length || 0), 0));
    const allComponents: ConsumedComponent[] = mockMappedItems.flatMap(item => 
        item.components?.map(c => ({ 
            name: c.name, 
            quantityDeducted: Math.floor(Math.random() * 50 + 10), // Random quantity 
            unit: c.unit 
        })) || []
    );
    
    // Shuffle and pick top items (simple version)
     const shuffled = allComponents.sort(() => 0.5 - Math.random());
     for (let i = 0; i < Math.min(numTopItems, shuffled.length); i++) {
         topItems.push(shuffled[i]);
     }

    return {
        date: date,
        totalTransactions: totalTransactions,
        totalSalesValue: parseFloat(totalSalesValue.toFixed(2)),
        topConsumedItems: topItems,
    };
}

// 2. Page Component
export default function ConsumptionsPage() {
    const [events, setEvents] = useState<ConsumptionEvent[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // State for selected date
    const [summaryData, setSummaryData] = useState<DailySummaryData | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // 3. Simulation Logic
    useEffect(() => {
        const generateMockEvent = (): ConsumptionEvent => {
            // Select a random mapped item
            const randomMappedItem = mockMappedItems[Math.floor(Math.random() * mockMappedItems.length)];
            const quantitySold = Math.floor(Math.random() * 3) + 1; // Sell 1 to 3 units

            const consumedComponents = randomMappedItem.components?.map(comp => ({
                name: comp.name,
                // Simulate actual deduction based on recipe quantity * quantity sold
                quantityDeducted: parseFloat((comp.quantity * quantitySold).toFixed(2)), 
                unit: comp.unit,
            })) || [];

            return {
                id: `evt-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
                timestamp: new Date(),
                posItemName: randomMappedItem.name,
                posItemId: randomMappedItem.id,
                quantitySold: quantitySold,
                components: consumedComponents,
            };
        };

        // Start interval
        intervalRef.current = setInterval(() => {
            const newEvent = generateMockEvent();
            setEvents(prevEvents => {
                const updatedEvents = [newEvent, ...prevEvents];
                // Keep only the last MAX_EVENTS
                return updatedEvents.slice(0, MAX_EVENTS);
            });
        }, UPDATE_INTERVAL);

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []); // Empty dependency array runs only on mount

    // Effect to load summary data when selectedDate changes
    useEffect(() => {
        let isMounted = true;
        async function loadSummary() {
            if (!selectedDate) {
                setSummaryData(null);
                return;
            }
            setIsSummaryLoading(true);
            setSummaryError(null);
            try {
                const data = await fetchDailySummary(selectedDate);
                if (isMounted) {
                    setSummaryData(data);
                }
            } catch (err) {
                console.error("Error fetching daily summary:", err);
                if (isMounted) {
                    setSummaryError(err instanceof Error ? err.message : "An unknown error occurred");
                }
            } finally {
                if (isMounted) {
                    setIsSummaryLoading(false);
                }
            }
        }
        loadSummary();
         return () => {
            isMounted = false; // Prevent state updates on unmounted component
        };
    }, [selectedDate]);

    // Date Picker Component (Inline for now)
    const DatePicker = () => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate} // Update state on selection
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        )
    }

    // 4. Display Logic
    return (
        <div className="container mx-auto py-6 px-9">
            <div className="space-y-8"> {/* Increased spacing */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">POS Consumptions</h1>
                    <p className="text-muted-foreground">
                        Monitoring simulated inventory deductions and daily summaries.
                    </p>
                </div>

                {/* Daily Summary Section */}
                <Card>
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Daily Summary</CardTitle>
                                <CardDescription>Consumption summary for the selected date.</CardDescription>
                            </div>
                             <DatePicker /> { /* Use Date Picker */}
                        </div>
                    </CardHeader>
                    <CardContent>
                       {isSummaryLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                       ) : summaryError ? (
                            <p className="text-red-600">Error: {summaryError}</p>
                       ) : summaryData ? (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                    <p className="text-2xl font-bold">{summaryData.totalTransactions}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Est. Sales Value</p>
                                    <p className="text-2xl font-bold">${summaryData.totalSalesValue.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Top Consumed Items</p>
                                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                       {summaryData.topConsumedItems.length > 0 ? (
                                            summaryData.topConsumedItems.map((item, idx) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span>{item.name}</span> 
                                                    <span className='font-mono text-xs'>{item.quantityDeducted} {item.unit}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li>No significant consumption.</li>
                                        )}
                                    </ul>
                                </div>
                           </div>
                       ) : (
                            <p className="text-muted-foreground">Select a date to view summary.</p>
                       )}
                    </CardContent>
                 </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Real-time Consumption Feed</CardTitle>
                        <CardDescription>Showing the latest {MAX_EVENTS} simulated consumption events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[60vh] pr-4"> {/* Adjust height as needed */}
                            <AnimatePresence initial={false}>
                                {events.length === 0 && (
                                    <p className="text-center text-muted-foreground py-10">
                                        Waiting for first consumption event...
                                    </p>
                                )}
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            layout // Enable smooth layout changes when list order changes
                                        >
                                            <Card className="overflow-hidden shadow-sm">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="font-semibold">
                                                                {event.quantitySold}x {event.posItemName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                POS ID: {event.posItemId}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground flex-shrink-0 pt-1">
                                                            {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 border-t pt-3">
                                                        <p className="text-xs font-medium mb-1.5">Components Consumed:</p>
                                                        {event.components.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {event.components.map((comp, index) => (
                                                                    <li key={index} className="text-xs text-muted-foreground flex justify-between">
                                                                        <span>{comp.name}</span>
                                                                        <Badge variant="secondary" className="font-mono">-{comp.quantityDeducted} {comp.unit}</Badge>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No components mapped.</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 