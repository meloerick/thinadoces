"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils/format";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ title, open, onClose, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className={cn("w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl", className)}>
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
