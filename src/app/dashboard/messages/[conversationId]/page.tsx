import Link from "next/link";
import { notFound } from "next/navigation";
import { sendMessageAction, markConversationReadAction } from "@/app/auth/actions";
import { IconChevronRight, IconMessageCircle, IconPackageOpen } from "@/components/icons";
import { getConversationThread } from "@/lib/data";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const thread = await getConversationThread(conversationId);

  if (!thread) {
    notFound();
  }

  // Mark as read by auto-submitting this action on the server
  // The getConversationThread already marks it read internally

  return (
    <div className="animate-fade-up space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/messages" className="font-medium text-muted hover:text-foreground">
          Messages
        </Link>
        <IconChevronRight className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
        <span className="truncate font-medium text-foreground">{thread.otherPartyName}</span>
      </div>

      {/* Chat container */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border" style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}>
        {/* Header */}
        <header className="shrink-0 border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            {thread.otherPartyAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thread.otherPartyAvatarUrl}
                alt={thread.otherPartyName}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                {thread.otherPartyInitials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-foreground">{thread.otherPartyName}</h1>
              <p className="truncate text-xs text-muted">
                {thread.listingTitle}
                {thread.offeredListingTitle ? ` ↔ ${thread.offeredListingTitle}` : ""}
                {" · "}
                <span className={
                  thread.offerStatus === "Accepted" ? "text-green" :
                  thread.offerStatus === "Completed" ? "text-blue-600" :
                  "text-muted"
                }>
                  {thread.offerStatus}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Messages area — flex-1 fills remaining space, scroll from bottom */}
        <div className="flex flex-1 flex-col-reverse overflow-y-auto bg-background/50 px-5 py-4">
          <div className="space-y-3">
            {thread.messages.length ? (
              thread.messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      message.isOwn
                        ? "bg-green text-white rounded-br-md"
                        : "bg-card text-foreground ring-1 ring-border rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.body}</p>
                    <p className={`mt-1.5 text-[10px] ${message.isOwn ? "text-white/60" : "text-muted"}`}>
                      {new Date(message.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <IconPackageOpen className="h-10 w-10 text-green" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-foreground">No messages yet</p>
                <p className="mt-1 text-xs text-muted">Start by sharing meetup details or next steps.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <form action={sendMessageAction} className="shrink-0 border-t border-border bg-card p-4">
          <input type="hidden" name="conversation_id" value={thread.id} />
          <div className="flex gap-2">
            <input
              name="body"
              type="text"
              autoComplete="off"
              disabled={!thread.canSend}
              placeholder={thread.canSend ? "Type a message..." : "This conversation is read-only"}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              disabled={!thread.canSend}
              className="shrink-0 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
