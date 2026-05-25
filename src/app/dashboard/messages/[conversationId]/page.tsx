import { notFound } from "next/navigation";
import { markConversationReadAction } from "@/app/auth/actions";
import { ConversationList } from "@/components/conversation-list";
import { ConversationThread } from "@/components/conversation-thread";
import { getConversations, getConversationThread } from "@/lib/data";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const [conversations, thread] = await Promise.all([
    getConversations(),
    getConversationThread(conversationId),
  ]);

  if (!thread) {
    notFound();
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>
        <p className="mt-0.5 text-sm text-muted">Coordinate meetup details after an offer is accepted.</p>
      </div>

      <form action={markConversationReadAction}>
        <input type="hidden" name="conversation_id" value={conversationId} />
        <button className="sr-only">Mark conversation read</button>
      </form>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ConversationList conversations={conversations} activeId={conversationId} />
        <ConversationThread thread={thread} />
      </div>
    </div>
  );
}
