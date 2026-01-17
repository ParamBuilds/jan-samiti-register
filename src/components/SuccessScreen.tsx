import { CheckCircle2, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  applicationId: string;
  name: string;
  onReset: () => void;
}

const SuccessScreen = ({ applicationId, name, onReset }: SuccessScreenProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="card-elevated p-8 md:p-10 text-center max-w-md w-full animate-slide-up">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div className="text-4xl mb-2">🇮🇳</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful!
          </h2>
          <p className="text-muted-foreground">
            Thank you for registering with Jan Jagran Seva Samiti
          </p>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Application ID</p>
          <p className="text-xl font-bold text-primary font-mono">
            {applicationId}
          </p>
        </div>

        <div className="space-y-2 text-left bg-primary/5 rounded-xl p-4 mb-6">
          <p className="text-sm">
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium text-foreground">{name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Please save your Application ID for future reference.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="saffron" size="lg" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={onReset}>
            <Home className="w-4 h-4 mr-2" />
            Register Another Member
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
