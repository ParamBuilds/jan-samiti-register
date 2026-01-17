import { Users } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="tricolor-bar" />
      <div className="container py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
              जन जागरण सेवा समिति
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Jan Jagran Seva Samiti – Member Registration
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
