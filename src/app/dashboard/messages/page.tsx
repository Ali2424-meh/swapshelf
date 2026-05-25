import { ConversationList } from "@/components/conversation-list";
import { ConversationThread } from "@/components/conversation-thread";
import { getConversations } from "@/lib/data";

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>
        <p className="mt-0.5 text-sm text-muted">Accepted swaps open a private chat thread here.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ConversationList conversations={conversations} />
        <ConversationThread thread={null} />
      </div>
    </div>
  );
}
