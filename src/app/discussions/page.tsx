"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Search, PlusCircle, User, Calendar, Loader2, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToastStore } from "@/store/toastStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Question {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
  _count: {
    answers: number;
  };
}

const questionFormSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be under 150 characters"),
  content: z.string()
    .min(10, "Content description must be at least 10 characters"),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function DiscussionsPage() {
  const { data: session } = useSession();
  const { addToast } = useToastStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/discussions");
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      } else {
        setError(json.message || "Failed to load discussions.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to discussions database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAskClick = () => {
    if (!session) {
      addToast("Please sign in to ask a question.", "warning");
      return;
    }
    setModalOpen(true);
  };

  const onSubmitQuestion = async (data: QuestionFormValues) => {
    setPosting(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        setQuestions((prev) => [json.data, ...prev]);
        setModalOpen(false);
        reset();
        addToast("Question posted successfully to the board!", "success");
      } else {
        addToast(json.message || "Failed to post question.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network connection error.", "error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-205 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-905 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-indigo-600" size={28} />
            Community Discussions
          </h1>
          <p className="text-xs text-slate-500">
            Ask questions, share advice, and discuss colleges with fellow student scholars.
          </p>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={handleAskClick}
          className="font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <PlusCircle size={16} />
          Ask a Question
        </Button>
      </div>

      {/* Forum list feed */}
      <div className="flex-1 flex flex-col justify-between">
        {loading ? (
          /* Skeletons */
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border border-slate-200 dark:border-slate-850 p-5 space-y-3">
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="40%" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <h3 className="font-bold text-lg">Error loading discussions</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          /* Empty feed board */
          <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
              <HelpCircle size={28} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No active discussions</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Be the first to start a conversation! Ask about admissions, cutoffs, or campus culture.
            </p>
            <Button variant="primary" size="sm" onClick={handleAskClick} className="font-semibold">
              Ask the First Question
            </Button>
          </div>
        ) : (
          /* Forum items list */
          <div className="space-y-4">
            {questions.map((question) => (
              <Link href={`/discussions/${question.id}`} key={question.id} className="block group">
                <Card className="hover:shadow-md border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3 transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                      {question.title}
                    </h3>
                    
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg flex-shrink-0 font-bold">
                      <MessageSquare size={13} className="text-slate-400" />
                      {question._count.answers} replies
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {question.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-50 dark:border-slate-850">
                    <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-300">
                      <User size={13} />
                      {question.user.name || "Anonymous Scholar"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(question.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Ask Question Popup Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ask a Community Question">
        <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-4">
          <Input
            label="Question Title"
            type="text"
            placeholder="e.g. Is hostels compulsory at IIM Bangalore?"
            error={errors.title?.message}
            {...register("title")}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Question Description</label>
            <textarea
              placeholder="Provide background context for your question. Describe your parameters, ranks, or specifics..."
              rows={4}
              className={`w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-lg shadow-sm outline-none transition-all duration-150
                ${
                  errors.content
                    ? "border-red-550 focus:border-red-550 focus:ring-1 focus:ring-red-550"
                    : "border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }
                placeholder:text-slate-400 dark:text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              {...register("content")}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.content.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold shadow-md pt-2.5" isLoading={posting}>
            Post Question
          </Button>
        </form>
      </Modal>
    </div>
  );
}
export { DiscussionsPage };
