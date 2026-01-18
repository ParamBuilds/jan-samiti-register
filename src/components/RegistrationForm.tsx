import { useState, useEffect } from "react";
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
  Home,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// All fields are now mandatory
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email"),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  // Present Address
  presentAddress: z.string().min(10, "Please enter your complete present address"),
  presentCity: z.string().min(2, "City is required"),
  presentDistrict: z.string().min(2, "District is required"),
  presentState: z.string().min(1, "Please select a state"),
  presentPincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  // Same as present
  sameAsPresent: z.boolean(),
  // Permanent Address
  permanentAddress: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentState: z.string().optional(),
  permanentPincode: z.string().optional(),
  // Other fields
  locationLink: z.string().optional(),
  hasVehicle: z.boolean(),
  vehicleTypes: z.array(z.string()).optional(),
  education: z.string().min(1, "Please select your education level"),
  declaration: z.literal(true, {
    errorMap: () => ({ message: "You must accept the declaration" }),
  }),
}).refine((data) => {
  if (!data.sameAsPresent) {
    return data.permanentAddress && data.permanentAddress.length >= 10 &&
           data.permanentCity && data.permanentCity.length >= 2 &&
           data.permanentDistrict && data.permanentDistrict.length >= 2 &&
           data.permanentState && data.permanentState.length >= 1 &&
           data.permanentPincode && /^\d{6}$/.test(data.permanentPincode);
  }
  return true;
}, {
  message: "Please fill all permanent address fields",
  path: ["permanentAddress"],
});

type FormData = z.infer<typeof formSchema>;

const RegistrationForm = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
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
      presentAddress: "",
      presentCity: "",
      presentDistrict: "",
      presentState: "",
      presentPincode: "",
      sameAsPresent: false,
      permanentAddress: "",
      permanentCity: "",
      permanentDistrict: "",
      permanentState: "",
      permanentPincode: "",
      locationLink: "",
      hasVehicle: false,
      vehicleTypes: [],
      education: "",
      declaration: undefined,
    },
  });

  const hasVehicle = form.watch("hasVehicle");
  const sameAsPresent = form.watch("sameAsPresent");
  
  // Watch present address fields for copying
  const presentAddress = form.watch("presentAddress");
  const presentCity = form.watch("presentCity");
  const presentDistrict = form.watch("presentDistrict");
  const presentState = form.watch("presentState");
  const presentPincode = form.watch("presentPincode");

  // Auto-copy present address to permanent when checkbox is checked
  useEffect(() => {
    if (sameAsPresent) {
      form.setValue("permanentAddress", presentAddress);
      form.setValue("permanentCity", presentCity);
      form.setValue("permanentDistrict", presentDistrict);
      form.setValue("permanentState", presentState);
      form.setValue("permanentPincode", presentPincode);
    }
  }, [sameAsPresent, presentAddress, presentCity, presentDistrict, presentState, presentPincode, form]);

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

  const uploadPhoto = async (file: File, applicationId: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${applicationId}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("member-photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("member-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!photo) {
      setPhotoError("Please upload your passport size photo");
      toast.error("Please upload your passport size photo");
      return;
    }
    setPhotoError(null);

    setIsSubmitting(true);
    
    try {
      const appId = generateApplicationId();
      
      // Upload photo
      const photoUrl = await uploadPhoto(photo, appId);
      
      if (!photoUrl) {
        toast.error("Failed to upload photo. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Get permanent address values
      const permAddress = data.sameAsPresent ? data.presentAddress : data.permanentAddress;
      const permCity = data.sameAsPresent ? data.presentCity : data.permanentCity;
      const permDistrict = data.sameAsPresent ? data.presentDistrict : data.permanentDistrict;
      const permState = data.sameAsPresent ? data.presentState : data.permanentState;
      const permPincode = data.sameAsPresent ? data.presentPincode : data.permanentPincode;

      // Insert registration data
      const { error } = await supabase.from("registrations").insert({
        full_name: data.fullName,
        mobile: data.mobile,
        email: data.email,
        aadhaar: data.aadhaar,
        photo_url: photoUrl,
        present_address: data.presentAddress,
        present_city: data.presentCity,
        present_district: data.presentDistrict,
        present_state: data.presentState,
        present_pincode: data.presentPincode,
        permanent_address: permAddress,
        permanent_city: permCity,
        permanent_district: permDistrict,
        permanent_state: permState,
        permanent_pincode: permPincode,
        same_as_present: data.sameAsPresent,
        location_link: data.locationLink || null,
        has_vehicle: data.hasVehicle,
        vehicle_types: data.hasVehicle ? data.vehicleTypes : null,
        education: data.education,
        application_id: appId,
      });

      if (error) {
        console.error("Registration error:", error);
        toast.error("Failed to submit registration. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setApplicationId(appId);
      setSubmittedName(data.fullName);
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setPhoto(null);
    setPhotoError(null);
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

  const vehicleOptions = ["Two Wheeler", "Four Wheeler", "Other"];

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
                <FormLabel>
                  Email ID <span className="text-destructive">*</span>
                </FormLabel>
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

          <PhotoUpload 
            value={photo} 
            onChange={(file) => {
              setPhoto(file);
              if (file) setPhotoError(null);
            }} 
            error={photoError || undefined}
            required 
          />

          <FormField
            control={form.control}
            name="aadhaar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Aadhaar Number <span className="text-destructive">*</span>
                </FormLabel>
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

        {/* Present Address */}
        <FormSection title="Present Address" icon={MapPin}>
          <FormField
            control={form.control}
            name="presentAddress"
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
              name="presentCity"
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
              name="presentDistrict"
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
              name="presentState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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
              name="presentPincode"
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

        {/* Permanent Address */}
        <FormSection title="Permanent Address" icon={Home}>
          <FormField
            control={form.control}
            name="sameAsPresent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-muted/50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    Same as Present Address
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {!sameAsPresent && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="permanentAddress"
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
                  name="permanentCity"
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
                  name="permanentDistrict"
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
                  name="permanentState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                  name="permanentPincode"
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
            </div>
          )}
        </FormSection>

        {/* Additional Information */}
        <FormSection title="Additional Information" icon={Car}>
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
            <div className="animate-fade-in">
              <FormLabel className="mb-3 block">Vehicle Type</FormLabel>
              <div className="flex flex-wrap gap-4">
                {vehicleOptions.map((type) => {
                  const currentValues = form.getValues("vehicleTypes") || [];
                  const isChecked = currentValues.includes(type);
                  
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vehicle-${type}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("vehicleTypes") || [];
                          if (checked) {
                            form.setValue("vehicleTypes", [...current, type]);
                          } else {
                            form.setValue("vehicleTypes", current.filter((v) => v !== type));
                          }
                        }}
                      />
                      <label
                        htmlFor={`vehicle-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Education Level <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
