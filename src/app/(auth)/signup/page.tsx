"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToastStore } from "@/store/toastStore";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GraduationCap } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        addToast("Registration successful! You can now log in.", "success");
        router.push("/login");
      } else {
        addToast(json.message || "Registration failed.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("A network error occurred. Please check database configuration.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-55/50 dark:bg-slate-950/20 py-12">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden animate-in fade-in duration-200">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 p-2.5 rounded-xl">
              <GraduationCap size={28} />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join us to save colleges, write student reviews, and compare packages.
          </p>
        </CardHeader>
        <CardBody className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Rahul Sharma"
              error={errors.name?.message}
              {...register("name")}
            />

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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" className="w-full font-bold shadow-md pt-2.5" isLoading={loading}>
              Create Account
            </Button>
          </form>


          {/* Prompt to login */}
          <p className="text-center text-xs text-slate-500 mt-4 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              Sign In here
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
export { SignupPage };
