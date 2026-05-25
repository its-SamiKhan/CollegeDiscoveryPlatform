"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, Heart, LogOut, Menu, User, X, Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    console.log(
      "%c🚀 Developed by Sami Khan (https://github.com/its-SamiKhan)",
      "color: #6366f1; font-weight: bold; font-size: 14px;"
    );
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              CollegeDiscovery
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/colleges"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Explore Colleges
            </Link>
            <Link
              href="/compare"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/predictor"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Predictor
            </Link>
            <Link
              href="/discussions"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Discussions
            </Link>
          </nav>

          {/* Right Side: Session Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title="Toggle color theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  <Heart size={16} className="text-red-500 fill-red-500" />
                  Saved Colleges
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  <User size={16} />
                  Profile
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                      {session.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "ST"}
                    </div>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" className="font-semibold shadow-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-500 md:hidden hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4 animate-in slide-in-from-top-10 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
          >
            Home
          </Link>
          <Link
            href="/colleges"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
          >
            Explore Colleges
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
          >
            Compare Colleges
          </Link>
          <Link
            href="/predictor"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
          >
            Rank Predictor
          </Link>
          <Link
            href="/discussions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
          >
            Discussions Board
          </Link>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Mobile Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 py-1 cursor-pointer"
          >
            {theme === "light" ? (
              <>
                <Moon size={16} />
                Switch to Dark Mode
              </>
            ) : (
              <>
                <Sun size={16} />
                Switch to Light Mode
              </>
            )}
          </button>

          <hr className="border-slate-100 dark:border-slate-800" />

          {session ? (
            <div className="space-y-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
              >
                <Heart size={16} className="text-red-500 fill-red-500" />
                Saved Colleges
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
              >
                <User size={16} />
                Profile ({session.user?.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 text-sm font-semibold text-red-500 py-1"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="sm" className="w-full font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="sm" className="w-full font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

