export default function PublicNotFound() {
  return (
    <main className="min-h-screen bg-[#f6f3ec] text-stone-950">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">MyVita</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Diesen Link gibt es nicht</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600">
          Prüf die Adresse oder bitte um einen neuen Vita-Link.
        </p>
      </div>
    </main>
  );
}
