import { Footer } from "./footer";

// Full-page message used by the 404 and error pages, which render outside the app shell.
export function MessagePage({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{body}</p>
        <div className="flex justify-center">{children}</div>
      </main>
      <Footer />
    </>
  );
}
