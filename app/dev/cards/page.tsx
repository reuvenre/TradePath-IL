import { CardReview } from "@/components/cards/card-review";
import { readCards, readFrontmatter } from "@/lib/content/loader";
import { he } from "@/lib/strings/he";

export default function DevCardsPage() {
  const lessonId = "s1-m1-l1";
  const { meta } = readFrontmatter(lessonId);
  const cards = readCards(lessonId).cards.map((c, i) => ({ ...c, lessonId, lessonTitle: meta.title, box: (i % 5) + 1 }));
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{he.cards.title}</h1>
      <CardReview cards={cards} persist={false} />
    </div>
  );
}
