import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RegistrationForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a photo.");

    setLoading(true);

    // Upload image to Supabase
    const { data, error } = await supabase.storage
      .from("member-photos")
      .upload(`photos/${file.name}`, file);

    if (error) {
      console.error("Upload failed:", error.message);
      alert("Image upload failed");
      setLoading(false);
      return;
    }

    // Get public URL
    const { publicUrl } = supabase.storage
      .from("member-photos")
      .getPublicUrl(data.path);

    // Insert user into database
    const { error: dbError } = await supabase
      .from("members")
      .insert([{ name, email, photo: publicUrl }]);

    if (dbError) {
      console.error("DB insert failed:", dbError.message);
      alert("Registration failed");
    } else {
      alert("Registration successful!");
      setName("");
      setEmail("");
      setFile(null);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="input"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="input"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && setFile(e.target.files[0])}
        required
        className="input"
      />
      <button type="submit" disabled={loading} className="btn">
        {loading ? "Uploading..." : "Register"}
      </button>
    </form>
  );
};

export default RegistrationForm;
