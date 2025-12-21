export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} VO Tracker. All rights reserved.
                </p>
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    Designed by <span className="font-medium text-foreground">Mohamed Roomy Mohamed Hassan</span>
                </p>
            </div>
        </footer>
    );
}
