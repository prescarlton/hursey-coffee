"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initialLoginState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialLoginState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
        />
        {state.error ? (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            aria-live="polite"
          >
            {state.error}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-amber-700 px-6 font-medium text-white hover:bg-amber-800 disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
