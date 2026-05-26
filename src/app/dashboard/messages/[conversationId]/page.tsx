import Link from "next/link";
import { notFound } from "next/navigation";
import { IconChevronRight } from "@/components/icons";
import { RealtimeMessageThread } from "@/components/realtime-message-thread";
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

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/messages" className="font-medium text-muted hover:text-foreground">
          Messages
        </Link>
        <IconChevronRight className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
        <span className="truncate font-medium text-foreground">{thread.otherPartyName}</span>
      </div>

      <div
        className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border"
        style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}
      >
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
                {thread.offeredListingTitle ? ` for ${thread.offeredListingTitle}` : ""}
                {" - "}
                <span
                  className={
                    thread.offerStatus === "Accepted"
                      ? "text-green"
                      : thread.offerStatus === "Completed"
                        ? "text-blue-600"
                        : "text-muted"
                  }
                >
                  {thread.offerStatus}
                </span>
              </p>
            </div>
          </div>
        </header>

        <RealtimeMessageThread key={thread.id} thread={thread} />
      </div>
    </div>
  );
}
