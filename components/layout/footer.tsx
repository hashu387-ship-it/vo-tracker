export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
                <p className="text-center text-[9px] leading-loose text-muted-foreground md:text-left opacity-60">
                    &copy; {new Date().getFullYear()} VO Tracker. All rights reserved.
                </p>
                <p className="text-[10px] text-slate-400/40 italic font-light tracking-widest hover:text-slate-400 transition-colors">
                    Designed by Mohamed Roomy Mohamed Hassan
                </p>
            </div>
        </footer>
    );
}
