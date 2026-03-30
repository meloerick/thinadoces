"use client";

import { cn } from "@/lib/utils/format";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onCheckedChange, disabled = false, label }: SwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-3", disabled && "opacity-60")}> 
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onCheckedChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full border transition",
          checked ? "border-brand-500 bg-brand-500" : "border-slate-300 bg-slate-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </label>
  );
}
