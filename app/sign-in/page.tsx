import type { Metadata } from "next";
import { Footer } from "@/components/shell/footer";
import { he } from "@/lib/strings/he";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: he.signIn.title };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { error } = await searchParams;

  return (
    <>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <bdi dir="ltr">{he.appName}</bdi>
          </p>
          <h1 className="text-2xl font-semibold">{he.signIn.title}</h1>
          <p className="text-muted-foreground">{he.signIn.intro}</p>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {he.signIn.linkFailed}
          </p>
        ) : null}
        <SignInForm />
      </main>
      <Footer />
    </>
  );
}
