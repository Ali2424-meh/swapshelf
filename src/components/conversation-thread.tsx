import { sendMessageAction } from "@/app/auth/actions";
import { IconMessageCircle, IconPackageOpen } from "@/components/icons";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import type { ConversationThreadData } from "@/lib/data";

export function ConversationThread({ thread }: { thread: ConversationThreadData | null }) {
  if (!thread) {
    return (
      <section className="flex min-h-[520px] flex-col items-center justify-center rounded-2xl bg-card px-6 py-16 text-center shadow-sm ring-1 ring-border">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
          <IconMessageCircle className="h-8 w-8 text-green" strokeWidth={1.5} />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold text-foreground">Choose a conversation</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">Select an accepted swap thread to view messages.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          {thread.otherPartyAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thread.otherPartyAvatarUrl} alt={thread.otherPartyName} className="h-11 w-11 rounded-full object-cover ring-1 ring-border" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
              {thread.otherPartyInitials}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold text-foreground">{thread.otherPartyName}</h1>
            <p className="truncate text-xs text-muted">
              {thread.listingTitle}
              {thread.offeredListingTitle ? ` for ${thread.offeredListingTitle}` : ""} - {thread.offerStatus}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-background/50 p-5">
        {thread.messages.length ? (
          thread.messages.map((message) => (
            <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  message.isOwn ? "bg-green text-white" : "bg-card text-foreground ring-1 ring-border"
                }`}
              >
                <p className="whitespace-pre-line leading-6">{message.body}</p>
                <p className={`mt-1 text-[10px] ${message.isOwn ? "text-white/70" : "text-muted"}`}>
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
          <div className="flex h-full flex-col items-center justify-center text-center">
            <IconPackageOpen className="h-10 w-10 text-green" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-muted">No messages yet. Start with meetup details or next steps.</p>
          </div>
        )}
      </div>

      <form action={sendMessageAction} className="border-t border-border p-4">
        <input type="hidden" name="conversation_id" value={thread.id} />
        <div className="flex gap-2">
          <input
            name="body"
            type="text"
            disabled={!thread.canSend}
            placeholder={thread.canSend ? "Write a message..." : "This conversation is read-only"}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <PendingSubmitButton
            disabled={!thread.canSend}
            pendingChildren="Sending..."
            className="rounded-xl bg-green px-5 py-3 text-sm font-semibold text-white hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </PendingSubmitButton>
        </div>
      </form>
    </section>
  );
}
