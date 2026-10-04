import Link from "next/link";
import { MessagePage } from "@/components/shell/message-page";
import { he } from "@/lib/strings/he";

export default function NotFound() {
  return (
    <MessagePage title={he.notFound.title} body={he.notFound.body}>
      <Link
        href="/"
        className="flex min-h-11 items-center rounded-lg px-3 font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {he.notFound.home}
      </Link>
    </MessagePage>
  );
}
