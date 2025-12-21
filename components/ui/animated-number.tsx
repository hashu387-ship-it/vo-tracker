'use client';

import { useEffect } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export function AnimatedNumber({ value }: { value: number }) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => formatCurrency(current));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}
