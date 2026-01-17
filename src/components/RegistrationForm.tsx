import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  MapPin,
  Car,
  FileCheck,
  Loader2,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormSection from "./FormSection";
import PhotoUpload from "./PhotoUpload";
import SuccessScreen from "./SuccessScreen";
import { indianStates, educationLevels } from "@/data/indianStates";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
  fullAddress: z.string().min(10, "Please enter your complete address"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(1, "Please select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  locationLink: z.string().optional(),
  hasVehicle: z.boolean(),
  vehicleTypes: z.array(z.string()).optional(),
  education: z.string().optional(),
  declaration: z.literal(true, {
    errorMap: () => ({ message: "You must accept the declaration" }),
  }),
});

type FormData = z.infer<typeof formSchema>;

const RegistrationForm = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      aadhaar: "",
      fullAddress: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      locationLink: "",
      hasVehicle: false,
      vehicleTypes: [],
      education: "",
      declaration: undefined,
    },
  });

  const hasVehicle = form.watch("hasVehicle");

  const generateApplicationId = () => {
    const prefix = "JJSS";
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${year}${random}`;
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          form.setValue("locationLink", mapsLink);
          toast.success("Location captured successfully!");
        },
        (error) => {
          toast.error("Unable to get location. Please try again.");
          console.error(error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const appId = generateApplicationId();
    setApplicationId(appId);
    setSubmittedName(data.fullName);
    setSubmitted(true);
    setIsSubmitting(false);
    
    console.log("Form submitted:", { ...data, photo, applicationId: appId });
    toast.success("Registration submitted successfully!");
  };

  const handleReset = () => {
    form.reset();
    setPhoto(null);
    setSubmitted(false);
    setApplicationId("");
    setSubmittedName("");
  };

  if (submitted) {
    return (
      <SuccessScreen
        applicationId={applicationId}
        name={submittedName}
        onReset={handleReset}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Details */}
        <FormSection title="Personal Details" icon={User}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mobile Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="10-digit mobile number"
                    className="input-field"
                    maxLength={10}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PhotoUpload value={photo} onChange={setPhoto} />

          <FormField
            control={form.control}
            name="aadhaar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhaar Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12-digit Aadhaar number"
                    className="input-field"
                    maxLength={12}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Address Details */}
        <FormSection title="Address Details" icon={MapPin}>
          <FormField
            control={form.control}
            name="fullAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Address <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="House No., Street, Landmark..."
                    className="input-field min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City"
                      className="input-field"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    District <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="District"
                      className="input-field"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="input-field">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border">
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pincode <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="6-digit pincode"
                      className="input-field"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="locationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Google Maps link or click Share Location"
                        className="input-field flex-1"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShareLocation}
                      className="shrink-0"
                    >
                      <MapPinned className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Optional Information */}
        <FormSection title="Optional Information" icon={Car}>
          <FormField
            control={form.control}
            name="hasVehicle"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Do you own a vehicle?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This helps us coordinate activities
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasVehicle && (
            <FormField
              control={form.control}
              name="vehicleTypes"
              render={() => (
                <FormItem className="animate-fade-in">
                  <FormLabel>Vehicle Type</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {["Two Wheeler", "Four Wheeler", "Other"].map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="vehicleTypes"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, type]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== type)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {type}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="input-field">
                      <SelectValue placeholder="Select Education Level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border border-border">
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Declaration & Submit */}
        <FormSection title="Declaration & Submit" icon={FileCheck}>
          <FormField
            control={form.control}
            name="declaration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-muted/50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    I confirm that the information provided is true and correct.
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    By submitting this form, you agree to the terms and conditions of Jan Jagran Seva Samiti.
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormMessage>{form.formState.errors.declaration?.message}</FormMessage>

          <Button
            type="submit"
            variant="saffron"
            size="xl"
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Submit Registration
              </>
            )}
          </Button>
        </FormSection>
      </form>
    </Form>
  );
};

export default RegistrationForm;
