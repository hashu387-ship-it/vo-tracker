'use server';

import { prisma as db } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD';
export type ActivityEntityType = 'VO' | 'FILE' | 'COMMENT';

export async function logActivity(
    action: ActivityAction,
    entityType: ActivityEntityType,
    entityId: string,
    details?: string
) {
    try {
        const user = await currentUser();
        if (!user) return;

        await db.activityLog.create({
            data: {
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`.trim() || user.username || 'Unknown User',
                action,
                entityType,
                entityId,
                details,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw, we don't want to block the main action if logging fails
    }
}

export async function getRecentActivity() {
    try {
        const logs = await db.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return logs;
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        return [];
    }
}
