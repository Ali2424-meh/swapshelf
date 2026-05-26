"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconChevronDown } from "@/components/icons";
import { useClickOutside } from "@/lib/hooks";

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
  const generatedId = useId();
  const buttonId = id ?? `${name}-${generatedId}`;
  const listboxId = `${buttonId}-listbox`;
  const initialValue = defaultValue === undefined ? undefined : String(defaultValue);
  const [selectedValue, setSelectedValue] = useState(() => initialValue ?? String(options[0]?.value ?? ""));
  const selectedIndex = Math.max(
    options.findIndex((option) => String(option.value) === selectedValue),
    0,
  );
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);
  const selected = options[selectedIndex];

  if (!selected) {
    return null;
  }

  function openMenu() {
    setHighlightedIndex(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;

    setSelectedValue(String(option.value));
    setHighlightedIndex(index);
    setOpen(false);
  }

  function moveHighlight(delta: number) {
    setHighlightedIndex((current) => {
      const next = current + delta;
      if (next < 0) return options.length - 1;
      if (next >= options.length) return 0;
      return next;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        moveHighlight(1);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        moveHighlight(-1);
      }
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
      setOpen(true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
      setOpen(true);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(highlightedIndex);
    }
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
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-1.5 text-sm font-medium text-foreground focus:outline-none"
      >
        <span className="truncate">{selected.label}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute left-0 top-full z-[70] mt-2 min-w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 ease-out origin-top-left"
        >
          {options.map((option, index) => {
            const active = String(selected.value) === String(option.value);
            const highlighted = highlightedIndex === index;

            return (
              <button
                key={String(option.value)}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => choose(index)}
                className={`flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm outline-none transition-colors hover:bg-green/10 hover:text-green focus-visible:bg-green/10 focus-visible:text-green ${
                  active || highlighted ? "bg-green-light font-semibold text-green" : "font-medium text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green" : highlighted ? "bg-green/40" : ""}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
