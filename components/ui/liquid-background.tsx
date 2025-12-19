'use client';

import { motion } from 'framer-motion';

export function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-background">
            {/* Primary Blob */}
            <div className="absolute top-0 left-[-10%] h-[500px] w-[500px] animate-blob rounded-full bg-primary/20 mix-blend-multiply blur-[100px] filter dark:bg-primary/10 dark:mix-blend-normal" />

            {/* Secondary Blob */}
            <div className="animation-delay-2000 absolute top-[20%] right-[-10%] h-[400px] w-[400px] animate-blob rounded-full bg-secondary/30 mix-blend-multiply blur-[100px] filter dark:bg-secondary/10 dark:mix-blend-normal" />

            {/* Accent Blob */}
            <div className="animation-delay-4000 absolute -bottom-8 left-[20%] h-[600px] w-[600px] animate-blob rounded-full bg-accent/20 mix-blend-multiply blur-[100px] filter dark:bg-accent/10 dark:mix-blend-normal" />

            {/* Noise Overlay */}
            <div className="bg-noise" />
        </div>
    );
}
