'use client'

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Define the structure of a history record
interface HistoryRecord {
    id: string;
    timestamp: string;
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_MAP' | 'BULK_DELETE';
    // Optional: Store previous/new components as JSON strings or structured objects
    // componentsSnapshot?: any; 
    notes?: string;
}

// Simulate fetching history data (replace with actual server action/API call)
async function fetchMappingHistory(mappingId: string): Promise<HistoryRecord[]> {
    console.log(`Simulating fetch for history of mapping ID: ${mappingId}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Generate some mock history data
    const actions: HistoryRecord['action'][] = ['CREATE', 'UPDATE', 'BULK_MAP', 'UPDATE'];
    const mockHistory: HistoryRecord[] = actions.map((action, index) => ({
        id: `hist_${mappingId}_${index}`,
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000 - index * 3600000).toISOString(), // Offset each record
        userId: index % 2 === 0 ? 'user_sim_123' : 'admin_sim_999',
        action: action,
        notes: action === 'UPDATE' ? `Updated ${index + 1} component(s)` : undefined,
    }));

    // Simulate potential error
    // if (Math.random() > 0.8) { throw new Error("Failed to fetch history"); }

    return mockHistory.reverse(); // Show newest first
}

interface MappingHistoryViewerProps {
    mappingId: string; // ID of the POS mapping item to fetch history for
}

export function MappingHistoryViewer({ mappingId }: MappingHistoryViewerProps) {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function loadHistory() {
            if (!mappingId) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchMappingHistory(mappingId);
                if (isMounted) {
                    setHistory(data);
                }
            } catch (err) {
                console.error("Error fetching mapping history:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "An unknown error occurred");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            isMounted = false; // Prevent state updates on unmounted component
        };
    }, [mappingId]);

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 p-4">Error loading history: {error}</p>;
    }

    if (history.length === 0) {
        return <p className="text-muted-foreground p-4">No history found for this mapping.</p>;
    }

    // Helper to get badge variant based on action
    const getActionVariant = (action: HistoryRecord['action']): "default" | "secondary" | "destructive" | "outline" => {
         switch(action) {
            case 'CREATE':
            case 'BULK_MAP': return 'default';
            case 'UPDATE': return 'secondary';
            case 'DELETE':
            case 'BULK_DELETE': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-3 p-1">
            {history.map((record) => (
                 <Card key={record.id} className="overflow-hidden">
                    <CardContent className="p-4 text-sm">
                         <div className="flex justify-between items-start gap-2">
                            <div>
                                <Badge variant={getActionVariant(record.action)} className="mb-1">
                                    {record.action.replace('_', ' ')}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    By: <span className="font-medium">{record.userId}</span>
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground flex-shrink-0">
                                {format(new Date(record.timestamp), 'PPp')} 
                            </p>
                         </div>
                         {record.notes && (
                            <p className="mt-2 text-xs italic text-gray-600">{record.notes}</p>
                         )}
                         {/* TODO: Add logic to display component changes if needed */}
                    </CardContent>
                 </Card>
            ))}
        </div>
    );
} 