"use client";

import { useActionState, useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { sendMessageInlineAction, type SendMessageState } from "@/app/auth/actions";
import { IconCheck, IconCheckCheck, IconEyeCheck, IconPackageOpen } from "@/components/icons";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/browser";
import type { ConversationMessage, ConversationThreadData } from "@/lib/data";

type MessageRow = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  delivered_at: string | null;
  seen_at: string | null;
};

type TypingPresence = {
  user_id?: string;
  typing?: boolean;
  updated_at?: string;
};

type SyncState = "connecting" | "live" | "fallback";

function messageFromRow(row: MessageRow, thread: ConversationThreadData): ConversationMessage {
  const isOwn = row.sender_id === thread.currentUserId;

  return {
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    senderName: isOwn ? "You" : thread.otherPartyName,
    senderInitials: isOwn ? "You" : thread.otherPartyInitials,
    senderAvatarUrl: isOwn ? null : thread.otherPartyAvatarUrl,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
    seenAt: row.seen_at,
    isOwn,
  };
}

function mergeMessage(messages: ConversationMessage[], message: ConversationMessage) {
  const index = messages.findIndex((existing) => existing.id === message.id);
  const next =
    index === -1
      ? [...messages, message]
      : messages.map((existing) => (existing.id === message.id ? { ...existing, ...message } : existing));

  return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function messageStatus(message: ConversationMessage) {
  if (message.seenAt) return { label: "Seen", Icon: IconEyeCheck };
  if (message.deliveredAt) return { label: "Delivered", Icon: IconCheckCheck };
  return { label: "Sent", Icon: IconCheck };
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-card px-4 py-2.5 text-sm text-muted shadow-sm ring-1 ring-border">
        <span className="sr-only">{name} is typing</span>
        <span aria-hidden className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
        </span>
      </div>
    </div>
  );
}

export function RealtimeMessageThread({ thread }: { thread: ConversationThreadData }) {
  const [messages, setMessages] = useState(thread.messages);
  const [syncState, setSyncState] = useState<SyncState>("connecting");
  const [otherTyping, setOtherTyping] = useState(false);
  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(sendMessageInlineAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const otherTypingTimerRef = useRef<number | null>(null);
  const deliveredAckedRef = useRef<Set<string>>(new Set());
  const seenAckedRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const trackTyping = useCallback(
    (typing: boolean) => {
      if (!thread.canSend) return;
      void channelRef.current?.track({
        user_id: thread.currentUserId,
        typing,
        updated_at: new Date().toISOString(),
      });
    },
    [thread.canSend, thread.currentUserId],
  );

  const handleTypingChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const typing = event.currentTarget.value.trim().length > 0;
      trackTyping(typing);

      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }

      if (typing) {
        typingTimerRef.current = window.setTimeout(() => trackTyping(false), 1500);
      }
    },
    [trackTyping],
  );

  const markIncomingMessages = useCallback(
    async (mode: "delivered" | "seen", candidateMessages: ConversationMessage[]) => {
      const remoteMessages = candidateMessages.filter((message) => !message.isOwn);
      if (!remoteMessages.length) return;

      const supabase = createClient();

      if (mode === "seen") {
        const unseenIds = remoteMessages
          .filter((message) => !message.seenAt && !seenAckedRef.current.has(message.id))
          .map((message) => message.id);

        if (!unseenIds.length) return;
        unseenIds.forEach((id) => seenAckedRef.current.add(id));
        await supabase.rpc("mark_conversation_seen", { p_conversation_id: thread.id });
        return;
      }

      const undeliveredIds = remoteMessages
        .filter((message) => !message.deliveredAt && !deliveredAckedRef.current.has(message.id))
        .map((message) => message.id);

      if (!undeliveredIds.length) return;
      undeliveredIds.forEach((id) => deliveredAckedRef.current.add(id));
      await supabase.rpc("mark_messages_delivered", {
        p_conversation_id: thread.id,
        p_message_ids: undeliveredIds,
      });
    },
    [thread.id],
  );

  useEffect(() => {
    if (!state.message) return;

    const timer = window.setTimeout(() => {
      setMessages((current) =>
        mergeMessage(
          current,
          messageFromRow(
            {
              id: state.message!.id,
              body: state.message!.body,
              sender_id: state.message!.senderId,
              created_at: state.message!.createdAt,
              delivered_at: state.message!.deliveredAt,
              seen_at: state.message!.seenAt,
            },
            thread,
          ),
        ),
      );
      formRef.current?.reset();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [state.message, thread]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${thread.id}`, {
        config: { presence: { key: thread.currentUserId } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${thread.id}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!row?.id) return;
          setMessages((current) => mergeMessage(current, messageFromRow(row, thread)));
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, TypingPresence[]>;
        const active = Object.values(state)
          .flat()
          .some((presence) => {
            if (presence.user_id === thread.currentUserId || !presence.typing || !presence.updated_at) return false;
            return Date.now() - new Date(presence.updated_at).getTime() < 5000;
          });

        setOtherTyping(active);
        if (otherTypingTimerRef.current) {
          window.clearTimeout(otherTypingTimerRef.current);
        }
        if (active) {
          otherTypingTimerRef.current = window.setTimeout(() => setOtherTyping(false), 2500);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel;
          setSyncState("live");
          void channel.track({
            user_id: thread.currentUserId,
            typing: false,
            updated_at: new Date().toISOString(),
          });
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setSyncState("fallback");
        }
      });

    return () => {
      trackTyping(false);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [thread, trackTyping]);

  useEffect(() => {
    if (syncState === "live") return;

    const supabase = createClient();
    let cancelled = false;

    async function pollMessages() {
      const { data } = await supabase
        .from("messages")
        .select("id, body, sender_id, created_at, delivered_at, seen_at")
        .eq("conversation_id", thread.id)
        .order("created_at", { ascending: true });

      if (cancelled || !data) return;
      setMessages((current) =>
        data.reduce((next, row) => mergeMessage(next, messageFromRow(row as MessageRow, thread)), current),
      );
    }

    void pollMessages();
    const interval = window.setInterval(pollMessages, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [syncState, thread]);

  useEffect(() => {
    const mode = document.visibilityState === "visible" ? "seen" : "delivered";
    void markIncomingMessages(mode, messages);
  }, [markIncomingMessages, messages]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void markIncomingMessages("seen", messages);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [markIncomingMessages, messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, otherTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      if (otherTypingTimerRef.current) window.clearTimeout(otherTypingTimerRef.current);
    };
  }, []);

  return (
    <>
      <div className="flex flex-1 overflow-y-auto bg-background/50 px-5 py-4">
        <div className="flex min-h-full w-full flex-col justify-end space-y-3">
          {messages.length ? (
            messages.map((message) => {
              const status = messageStatus(message);

              return (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      message.isOwn
                        ? "rounded-br-md bg-green text-white"
                        : "rounded-bl-md bg-card text-foreground ring-1 ring-border"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.body}</p>
                    <div
                      className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                        message.isOwn ? "justify-end text-white/70" : "text-muted"
                      }`}
                    >
                      <span>
                        {new Date(message.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.isOwn && (
                        <span className="inline-flex items-center gap-1" aria-label={status.label} title={status.label}>
                          <status.Icon className="h-3 w-3" strokeWidth={2.25} />
                          {status.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconPackageOpen className="h-10 w-10 text-green" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-foreground">No messages yet</p>
              <p className="mt-1 text-xs text-muted">Start by sharing meetup details or next steps.</p>
            </div>
          )}
          {otherTyping && <TypingIndicator name={thread.otherPartyName} />}
          <div ref={scrollRef} />
        </div>
      </div>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={() => trackTyping(false)}
        className="shrink-0 border-t border-border bg-card p-4"
      >
        <input type="hidden" name="conversation_id" value={thread.id} />
        {state.error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.error}
          </p>
        )}
        <div className="mb-2 flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${syncState === "live" ? "bg-green" : "bg-amber-500"}`}
              aria-hidden
            />
            {syncState === "live" ? "Live" : "Syncing"}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            name="body"
            type="text"
            autoComplete="off"
            disabled={!thread.canSend || pending}
            onChange={handleTypingChange}
            placeholder={thread.canSend ? "Type a message..." : "This conversation is read-only"}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <PendingSubmitButton
            disabled={!thread.canSend}
            pendingChildren="Sending..."
            className="shrink-0 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark disabled:cursor-not-allowed"
          >
            Send
          </PendingSubmitButton>
        </div>
      </form>
    </>
  );
}
