import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Make sure this points to your correct Supabase client
import toast from "sonner";

const RegistrationForm = () => {
  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    date_of_birth: "",
    mobile: "",
    email: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    aadhaar_last4: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "document") => {
    if (e.target.files && e.target.files[0]) {
      type === "photo" ? setPhotoFile(e.target.files[0]) : setDocumentFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("uploads") // Make sure you created a bucket named 'uploads'
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;
    const { publicUrl } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!photoFile || !documentFile) {
        toast.error("Please upload both photo and document.");
        setLoading(false);
        return;
      }

      const photo_url = await uploadFile(photoFile, "photos");
      const document_url = await uploadFile(documentFile, "documents");

      const { data, error } = await supabase.from("applications").insert([
        {
          ...form,
          photo_url,
          document_url,
          status: "pending",
          created_at: new Date(),
        },
      ]);

      if (error) throw error;

      toast.success("Registration submitted successfully!");
      setForm({
        full_name: "",
        father_name: "",
        date_of_birth: "",
        mobile: "",
        email: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
        aadhaar_last4: "",
      });
      setPhotoFile(null);
      setDocumentFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit registration. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value={form.full_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="father_name"
        placeholder="Father's Name"
        value={form.father_name}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date_of_birth"
        value={form.date_of_birth}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="mobile"
        placeholder="Mobile Number"
        value={form.mobile}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <textarea
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="district"
        placeholder="District"
        value={form.district}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="state"
        placeholder="State"
        value={form.state}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="pincode"
        placeholder="Pincode"
        value={form.pincode}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="aadhaar_last4"
        placeholder="Last 4 digits of Aadhaar"
        value={form.aadhaar_last4}
        onChange={handleChange}
        required
      />
      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "photo")} required />
      <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileChange(e, "document")} required />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default RegistrationForm;
