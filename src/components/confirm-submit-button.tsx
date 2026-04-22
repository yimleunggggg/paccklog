"use client";

import { useRef, useState, type ReactNode } from "react";

type ConfirmSubmitButtonProps = {
  confirmText: string;
  cancelText?: string;
  okText?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

export function ConfirmSubmitButton({ confirmText, cancelText = "Cancel", okText = "Confirm", className, ariaLabel, children }: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    const form = triggerRef.current?.form;
    setOpen(false);
    form?.requestSubmit();
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={className} aria-label={ariaLabel} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-4">
            <p className="text-[16px] text-[#1f1f1b]">{confirmText}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="brand-btn-soft px-3 py-2 text-[12px]" onClick={() => setOpen(false)}>
                {cancelText}
              </button>
              <button type="button" className="brand-btn-primary px-3 py-2 text-[12px]" onClick={handleConfirm}>
                {okText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
