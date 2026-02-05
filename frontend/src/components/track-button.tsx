"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api, ApplicationStatus } from "@/lib/api";

interface TrackButtonProps {
  universityId: string;
  universityName: string;
  variant?: "icon" | "button" | "labeled";
  className?: string;
}

export function TrackButton({ universityId, universityName, variant = "icon", className = "" }: TrackButtonProps) {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [program, setProgram] = useState("");
  const [intake, setIntake] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("RESEARCHING");
  const [error, setError] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        router.push("/sign-in");
        return;
      }

      await api.createApplication(token, {
        universityId,
        status,
        program: program || undefined,
        intake: intake || undefined,
      });

      setShowModal(false);
      setProgram("");
      setIntake("");
      setStatus("RESEARCHING");
      
      // Navigate to applications page
      router.push("/dashboard/applications");
    } catch (err: any) {
      if (err.message?.includes("already tracking")) {
        setError("You're already tracking this university");
      } else {
        setError("Failed to add application. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
    setProgram("");
    setIntake("");
    setStatus("RESEARCHING");
  };

  return (
    <>
      {variant === "labeled" ? (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 text-[#6B7280] hover:text-[#2563EB] hover:bg-blue-50 ${className}`}
          title="Track application"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs font-medium">Track</span>
        </button>
      ) : variant === "icon" ? (
        <button
          onClick={handleClick}
          className={`p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 hover:scale-110 ${className}`}
          title="Track application"
        >
          <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors ${className}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Track Application
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#111827] mb-1">Track Application</h2>
              <p className="text-sm text-[#6B7280]">
                Add <span className="font-medium">{universityName}</span> to your application tracker
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  <option value="RESEARCHING">🔍 Researching</option>
                  <option value="PREPARING">📝 Preparing Documents</option>
                  <option value="APPLIED">📨 Applied</option>
                  <option value="ACCEPTED">🎉 Accepted</option>
                  <option value="REJECTED">❌ Rejected</option>
                </select>
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  Program <span className="text-[#6B7280] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g., MS Computer Science"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              {/* Intake */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  Intake <span className="text-[#6B7280] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  placeholder="e.g., Fall 2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-[#374151] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Adding..." : "Add to Tracker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
