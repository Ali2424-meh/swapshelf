import Link from "next/link";
import { IconMessageCircle } from "@/components/icons";
import type { ConversationSummary } from "@/lib/data";

export function ConversationList({
  conversations,
  activeId,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
}) {
  if (!conversations.length) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-light">
          <IconMessageCircle className="h-7 w-7 text-green" strokeWidth={1.5} />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">No conversations yet</h2>
        <p className="mt-1 text-sm text-muted">Chats open after an offer is accepted.</p>
      </div>
    );
  }

  return (
    <aside className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Conversations</h2>
      </div>
      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/dashboard/messages/${conversation.id}`}
            className={`block p-4 hover:bg-background ${activeId === conversation.id ? "bg-green-light" : ""}`}
          >
            <div className="flex items-start gap-3">
              {conversation.otherPartyAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conversation.otherPartyAvatarUrl}
                  alt={conversation.otherPartyName}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                  {conversation.otherPartyInitials}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{conversation.otherPartyName}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="rounded-full bg-green px-2 py-0.5 text-[10px] font-bold text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{conversation.listingTitle}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{conversation.latestMessage}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
