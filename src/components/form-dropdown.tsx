"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconChevronDown } from "@/components/icons";

export type DropdownOption = {
  value: string | number;
  label: string;
};

type FormDropdownProps = {
  id?: string;
  name: string;
  options: DropdownOption[];
  defaultValue?: string | number;
  icon?: ReactNode;
  className?: string;
};

export function FormDropdown({ id, name, options, defaultValue, icon, className }: FormDropdownProps) {
  const initialValue = defaultValue === undefined ? undefined : String(defaultValue);
  const [selectedValue, setSelectedValue] = useState(
    () => initialValue ?? String(options[0]?.value ?? ""),
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => String(option.value) === selectedValue) ?? options[0];

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!selected) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={
        className ??
        "relative flex items-center rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition focus-within:border-green focus-within:ring-1 focus-within:ring-green/20"
      }
    >
      {icon}
      <input type="hidden" name={name} value={selected.value} />
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-w-0 flex-1 items-center justify-between gap-1.5 text-sm font-medium text-foreground focus:outline-none"
      >
        <span className="truncate">{selected.label}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[70] mt-2 min-w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          {options.map((option) => {
            const active = String(selected.value) === String(option.value);

            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  setSelectedValue(String(option.value));
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  active ? "font-semibold text-green" : "font-medium text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green" : ""}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
