"use client";

import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export default function SignInPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <AuthModal open={open} onOpenChange={setOpen} />
    </div>
  );
} 