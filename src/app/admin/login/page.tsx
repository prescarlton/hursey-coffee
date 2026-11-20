import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/orders");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <Image
        src="/hursey_logo.png"
        alt="Malcolm C. Hursey Montessori"
        width={96}
        height={96}
        loading="eager"
        className="mb-6 rounded-full ring-1 ring-black/10 dark:ring-white/15"
      />
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Bulldog Brews — Admin
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Enter the shared password to manage the menu and orders.
      </p>
      <LoginForm />
    </div>
  );
}
