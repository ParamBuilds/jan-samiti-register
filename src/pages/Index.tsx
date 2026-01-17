import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Member Registration
            </h2>
            <p className="text-muted-foreground">
              Join our mission for community development and social welfare
            </p>
          </div>
          
          <RegistrationForm />
          
          <footer className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Jan Jagran Seva Samiti. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For support, contact us at support@jjss.org
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
