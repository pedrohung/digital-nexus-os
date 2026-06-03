export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-border pt-5 pb-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="font-mono">© {currentYear} NEXUS360. All rights reserved.</p>
        <p className="font-mono flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          created &amp; powered by{" "}
          <span className="lowercase tracking-wider text-emerald-400 font-semibold">
            astrumshielda
          </span>
        </p>
      </div>
    </footer>
  );
}
