export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row md:py-0">
                <p className="text-center text-[9px] leading-loose text-muted-foreground opacity-60">
                    &copy; 2025 VO Tracker | by Mohamed Roomy Mohamed Hassan
                </p>
            </div>
        </footer>
    );
}
