"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function TripActionSubmitButton({
  children,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className={className}
      disabled={pending}
      title={pending ? "处理中..." : ariaLabel}
    >
      <span className={pending ? "opacity-55" : ""}>{children}</span>
    </button>
  );
}
