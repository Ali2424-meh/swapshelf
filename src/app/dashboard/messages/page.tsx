import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
        <MessageCircle className="h-16 w-16 text-gray-300" strokeWidth={1} />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No conversations yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Chat with other swappers after you send or receive an offer.
        </p>
      </div>
    </>
  );
}
