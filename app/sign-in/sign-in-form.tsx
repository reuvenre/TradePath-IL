"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { he } from "@/lib/strings/he";
import { sendMagicLink, type SignInState } from "./actions";

const initial: SignInState = { status: "idle" };

export function SignInForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{he.signIn.emailLabel}</Label>
        <Input
          key={state.email}
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.email}
          aria-invalid={state.status === "error" || undefined}
          className="h-11"
          aria-describedby="sign-in-status"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? he.signIn.sending : he.signIn.submit}
      </Button>
      <p
        id="sign-in-status"
        role="status"
        className={state.status === "error" ? "text-sm text-destructive" : "text-sm"}
      >
        {state.message}
      </p>
    </form>
  );
}
