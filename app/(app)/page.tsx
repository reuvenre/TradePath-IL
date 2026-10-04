import { EmptyScreen } from "@/components/shell/empty-screen";
import { he } from "@/lib/strings/he";

export default function TodayPage() {
  return <EmptyScreen title={he.today.title} heading={he.today.emptyTitle} body={he.today.emptyBody} />;
}
