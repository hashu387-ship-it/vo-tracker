'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();
    // The landing page ('/') ships its own designed footer.
    if (pathname === '/') return null;

    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row md:py-0">
                <p className="text-center text-[10px] leading-loose text-muted-foreground opacity-70">
                    &copy; 2025 VO Tracker | All Rights Reserved | Mohamed Roomy Mohamed Hassan | Sr. Quantity Surveyor - FFC
                </p>
            </div>
        </footer>
    );
}
