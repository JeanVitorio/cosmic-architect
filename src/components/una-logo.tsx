import logo from "@/assets/una-logo.png";

export function UnaLogo({ size = 32, withWordmark = true, className = "" }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="UNA" width={size} height={size} className="object-contain" style={{ width: size, height: size }} />
      {withWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-gradient-brand">UNA</span>
      )}
    </div>
  );
}
