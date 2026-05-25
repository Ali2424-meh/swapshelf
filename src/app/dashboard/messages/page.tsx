import Link from "next/link";
import { IconMessageCircle } from "@/components/icons";
import { getConversations } from "@/lib/data";

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>
        <p className="mt-0.5 text-sm text-muted">
          Private conversations with swap partners. Once an offer is accepted, you can chat here.
        </p>
      </div>

      {!conversations.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
            <IconMessageCircle className="h-8 w-8 text-green" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No conversations yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Chats open automatically after a swap offer is accepted. Browse listings and send an offer to get started.
          </p>
          <Link
            href="/browse"
            className="mt-6 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          <div className="border-b border-border px-5 py-3">
            <h2 className="font-display text-base font-semibold text-foreground">
              All Conversations
              <span className="ml-2 text-sm font-normal text-muted">({conversations.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-green-light/50"
              >
                {conversation.otherPartyAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversation.otherPartyAvatarUrl}
                    alt={conversation.otherPartyName}
                    className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                    {conversation.otherPartyInitials}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {conversation.otherPartyName}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {conversation.latestAt && (
                        <span className="text-[11px] text-muted">
                          {new Date(conversation.latestAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1.5 text-[10px] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-green">{conversation.listingTitle}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{conversation.latestMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
