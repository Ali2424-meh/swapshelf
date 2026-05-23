export default function MessagesPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>
        <p className="mt-0.5 text-sm text-muted">Chat with other community members</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
        <span className="text-6xl">💬</span>
        <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No conversations yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Chat with other swappers after you send or receive an offer.
        </p>
      </div>
    </div>
  );
}
