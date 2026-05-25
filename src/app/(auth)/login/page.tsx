"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToastStore } from "@/store/toastStore";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email.toLowerCase(),
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        // Human readable error adjustments
        let msg = res.error;
        if (res.error === "CredentialsSignin") {
          msg = "Invalid email or password. Please try again.";
        }
        addToast(msg, "error");
      } else {
        addToast("Signed in successfully! Welcome back.", "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      addToast("An unexpected error occurred during login.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error(err);
      addToast("Failed to initiate Google sign-in.", "error");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/20 py-12">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 p-2.5 rounded-xl">
              <GraduationCap size={28} />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your saved colleges, reviews, and metric catalogs.
          </p>
        </CardHeader>
        <CardBody className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" className="w-full font-bold shadow-md" isLoading={loading}>
              Sign In
            </Button>
          </form>


          {/* Prompt to register */}
          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            New to CollegeDiscovery?{" "}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              Create an account
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">DEFAULT MVP USER ACCOUNT FOR TESTING:</span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Email: <strong className="text-slate-600 dark:text-slate-300">student@college.com</strong> | Password: <strong className="text-slate-600 dark:text-slate-300">password123</strong>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
export { LoginPage };
