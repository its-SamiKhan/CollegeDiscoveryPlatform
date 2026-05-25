"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, ArrowLeft, Send, Sparkles, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToastStore } from "@/store/toastStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Question {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
  answers: Answer[];
}

interface DiscussionThreadViewProps {
  question: Question;
}

export default function DiscussionThreadView({ question }: DiscussionThreadViewProps) {
  const { data: session } = useSession();
  const { addToast } = useToastStore();
  const router = useRouter();

  const [answers, setAnswers] = useState<Answer[]>(question.answers || []);
  const [replyInput, setReplyInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      addToast("Please sign in to post a reply.", "warning");
      return;
    }
    if (!replyInput.trim()) {
      addToast("Reply description cannot be empty.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${question.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyInput }),
      });
      const json = await res.json();

      if (json.success) {
        setAnswers((prev) => [...prev, json.data]); // Append new reply at the end of the thread
        setReplyInput("");
        addToast("Reply submitted successfully!", "success");
      } else {
        addToast(json.message || "Failed to submit reply.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* Go Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Go Back to Discussions
        </button>
      </div>

      {/* Main Question Panel */}
      <Card className="border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
        <CardBody className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 dark:border-indigo-950 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-sm">
              <Sparkles size={13} />
              Q&A Thread
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {question.title}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal whitespace-pre-line">
            {question.content}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-4">
            <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
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
        </CardBody>
      </Card>

      {/* Replies Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mt-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-600" />
          Scholar Replies ({answers.length})
        </h3>
      </div>

      {/* Replies Timeline */}
      <div className="space-y-4">
        {answers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No replies have been posted yet. Share your experience!</p>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl space-y-3 bg-slate-50/20 dark:bg-slate-900/10 animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-3">
                {answer.user.image ? (
                  <img
                    src={answer.user.image}
                    alt={answer.user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center text-xs">
                    {answer.user.name ? answer.user.name.substring(0, 2).toUpperCase() : "RV"}
                  </div>
                )}
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block mb-0.5">
                    {answer.user.name || "Anonymous Scholar"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(answer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {answer.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Reply Submission form */}
      <div className="border-t border-slate-205 dark:border-slate-800 pt-6 mt-6">
        {session ? (
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Submit a Scholar Reply</h4>
            <div className="relative">
              <textarea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Share your advice or answer... Be factual, encouraging, and clear."
                rows={4}
                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-800 p-4 text-xs rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="font-bold flex items-center gap-1.5 shadow-sm" isLoading={submitting}>
              <Send size={14} />
              Submit Reply
            </Button>
          </form>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
            Please{" "}
            <a href={`/login?callbackUrl=/discussions/${question.id}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              sign in
            </a>{" "}
            to join this community thread and submit a reply.
          </div>
        )}
      </div>
    </div>
  );
}
export { DiscussionThreadView };
