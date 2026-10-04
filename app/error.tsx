"use client";

import { MessagePage } from "@/components/shell/message-page";
import { Button } from "@/components/ui/button";
import { he } from "@/lib/strings/he";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <MessagePage title={he.error.title} body={he.error.body}>
      <Button className="h-11 px-4" onClick={reset}>
        {he.error.retry}
      </Button>
    </MessagePage>
  );
}
