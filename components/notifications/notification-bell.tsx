'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getRecentActivity } from '@/lib/actions/activity';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => getRecentActivity(),
        refetchInterval: 10000, // Poll every 10 seconds
    });

    useEffect(() => {
        // Check if there are any activities newer than our last read timestamp
        if (activities.length > 0) {
            const newestActivityTime = new Date(activities[0].createdAt).getTime();
            if (newestActivityTime > lastReadTimestamp) {
                setHasUnread(true);
            }
        }
    }, [activities, lastReadTimestamp]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && activities.length > 0) {
            // Mark as read by updating timestamp to the newest activity
            const newestActivityTime = new Date(activities[0].createdAt).getTime();
            setLastReadTimestamp(newestActivityTime);
            setHasUnread(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/70 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rsg-gold animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-[#0A1628]/95 backdrop-blur-xl border-white/10 text-white">
                <div className="p-4 border-b border-white/10">
                    <h4 className="font-semibold text-sm">Recent Activity</h4>
                </div>
                <ScrollArea className="h-[300px]">
                    {activities.length === 0 ? (
                        <div className="p-4 text-center text-sm text-white/50">
                            No recent activity
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {activities.map((activity: any) => (
                                <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none text-white/90">
                                                {activity.userName}
                                            </p>
                                            <p className="text-xs text-white/60">
                                                {getActivityMessage(activity)}
                                            </p>
                                            <p className="text-[10px] text-white/40">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

function getActivityMessage(activity: any) {
    const { action, entityType, details } = activity;
    if (details) return details;

    switch (action) {
        case 'CREATE':
            return `Created a new ${entityType}`;
        case 'UPDATE':
            return `Updated ${entityType}`;
        case 'DELETE':
            return `Deleted ${entityType}`;
        case 'UPLOAD':
            return `Uploaded a file`;
        default:
            return `${action} ${entityType}`;
    }
}
