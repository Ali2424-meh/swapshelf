import { sendMessageAction } from "@/app/auth/actions";
import { getConversations } from "@/lib/data";

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>
        <p className="mt-0.5 text-sm text-muted">Chat with other community members</p>
      </div>

      {conversations.length ? (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <article key={conversation.id} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                  {conversation.otherPartyInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{conversation.otherPartyName}</p>
                    {conversation.latestAt && (
                      <span className="text-xs text-muted">{new Date(conversation.latestAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{conversation.latestMessage}</p>
                  <form action={sendMessageAction} className="mt-4 flex gap-2">
                    <input type="hidden" name="conversation_id" value={conversation.id} />
                    <input
                      name="body"
                      type="text"
                      placeholder="Write a message..."
                      className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none"
                    />
                    <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="text-6xl">💬</span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No conversations yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">Chat with other swappers after you send or receive an offer.</p>
        </div>
      )}
    </div>
  );
}
