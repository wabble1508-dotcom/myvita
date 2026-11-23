import { Brand } from "@/components/site/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8">
      <Brand />
      <div className="flex flex-1 flex-col justify-center py-10">{children}</div>
    </main>
  );
}
