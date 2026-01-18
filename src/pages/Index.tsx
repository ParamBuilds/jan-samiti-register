import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Make sure your Supabase client is set up

const RegistrationForm = () => {
  const [form, setForm] = useState({
    name: "",
    aadhar: "",
    email: "",
    bankName: "",
    ifsc: "",
    branch: "",
    permanentAddress: "",
    presentAddress: "",
    vehicleNo: "",
    vehicleType: "",
    married: "No",
    children: "",
    education: "",
    workExperience: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoto(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let photoUrl = "";
    if (photo) {
      const filePath = `photos/${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, photo, { contentType: photo.type });

      if (uploadError) {
        setLoading(false);
        return alert("Image upload failed: " + uploadError.message);
      }

      // Get public URL
      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      photoUrl = data.publicUrl;
    }

    const { error } = await supabase.from("registrations").insert([
      { ...form, photo: photoUrl }
    ]);

    setLoading(false);
    if (error) return alert("Registration failed: " + error.message);

    alert("Registration successful!");
    setForm({
      name: "",
      aadhar: "",
      email: "",
      bankName: "",
      ifsc: "",
      branch: "",
      permanentAddress: "",
      presentAddress: "",
      vehicleNo: "",
      vehicleType: "",
      married: "No",
      children: "",
      education: "",
      workExperience: "",
    });
    setPhoto(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="input" />
      <input name="aadhar" value={form.aadhar} onChange={handleChange} placeholder="Aadhar Number" required className="input" />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="input" />
      <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank Name" className="input" />
      <input name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="IFSC Code" className="input" />
      <input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch" className="input" />
      <textarea name="permanentAddress" value={form.permanentAddress} onChange={handleChange} placeholder="Permanent Address" className="input" />
      <textarea name="presentAddress" value={form.presentAddress} onChange={handleChange} placeholder="Present Address" className="input" />
      <input name="vehicleNo" value={form.vehicleNo} onChange={handleChange} placeholder="Vehicle Number" className="input" />
      <input name="vehicleType" value={form.vehicleType} onChange={handleChange} placeholder="Vehicle Type" className="input" />
      <select name="married" value={form.married} onChange={handleChange} className="input">
        <option value="No">Unmarried</option>
        <option value="Yes">Married</option>
      </select>
      {form.married === "Yes" && (
        <input name="children" value={form.children} onChange={handleChange} placeholder="Children (if any)" className="input" />
      )}
      <input name="education" value={form.education} onChange={handleChange} placeholder="Education Qualification" className="input" />
      <input name="workExperience" value={form.workExperience} onChange={handleChange} placeholder="Work Experience" className="input" />
      <input type="file" onChange={handlePhoto} accept="image/*" className="input" />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
};

export default RegistrationForm;
