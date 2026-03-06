import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import validator from "validator";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "login" | "signup";

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [showPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, signUp, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    if (!validator.isEmail(email)) return "Invalid email";
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      toast({ title: emailError, variant: "destructive" });
      return;
    }
    try {
      await login(email, password);
      toast({ title: "Logged in" });
      onClose();
    } catch {
      toast({ title: "Login failed", variant: "destructive" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      toast({ title: emailError, variant: "destructive" });
      return;
    }
    try {
      await signUp(name, email, password);
      toast({ title: "Account created" });
      onClose();
    } catch {
      toast({ title: "Signup failed", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white p-6 rounded-xl w-full max-w-md">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            {activeTab === "login" ? "Login" : "Sign Up"}
          </h2>

        </div>

        <div className="flex mb-4">
          <button
            className={`flex-1 ${activeTab === "login" && "font-bold"}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 ${activeTab === "signup" && "font-bold"}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={activeTab === "login" ? handleLogin : handleSignUp}>
          {activeTab === "signup" && (
            <Input
              placeholder="Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          )}

          <Input
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Loading..." : activeTab === "login" ? "Login" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
