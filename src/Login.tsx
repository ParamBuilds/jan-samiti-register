import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      navigate("/admin");
    } else {
      alert("Invalid password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl mb-4">Admin Login</h2>
        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Admin password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-orange-600 text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
