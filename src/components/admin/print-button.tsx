"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-10 rounded-full bg-amber-700 px-5 text-sm font-medium text-white hover:bg-amber-800 print:hidden"
    >
      Print
    </button>
  );
}
