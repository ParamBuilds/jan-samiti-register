import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

const FormSection = ({ title, icon: Icon, children }: FormSectionProps) => {
  return (
    <div className="card-elevated p-5 md:p-6 animate-fade-in">
      <div className="section-title mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span>{title}</span>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
