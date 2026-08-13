"use client";

import type { ReactNode } from "react";


interface PromptSelectProps {
  label: string;

  value?: string | null;

  onChange: (value: string) => void;

  options: Array<{
    id: string;
    name: string;
  }>;

  placeholder?: string;
}


export default function PromptSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید",
}: PromptSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          py-2
          text-sm
          outline-none
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
