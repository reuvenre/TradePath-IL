export function EmptyScreen({ title, heading, body }: { title: string; heading?: string; body: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <section className="rounded-xl border border-dashed p-6 text-center">
        {heading ? <h2 className="mb-1 text-lg font-medium">{heading}</h2> : null}
        <p className="text-muted-foreground">{body}</p>
      </section>
    </div>
  );
}
