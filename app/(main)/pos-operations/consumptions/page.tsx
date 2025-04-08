'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long lists
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion'; // For nice entry animation
import { formatDistanceToNow } from 'date-fns';

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

const MAX_EVENTS = 50; // Max number of events to keep in the list
const UPDATE_INTERVAL = 3000; // Update every 3 seconds (adjust as needed)

// 2. Page Component
export default function ConsumptionsPage() {
    const [events, setEvents] = useState<ConsumptionEvent[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // 4. Display Logic
    return (
        <div className="container mx-auto py-6 px-9">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Real-time Consumption</h1>
                    <p className="text-muted-foreground">
                        Monitoring simulated inventory deductions based on POS activity.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Consumption Feed</CardTitle>
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