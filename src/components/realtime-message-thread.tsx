"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendMessageInlineAction, type SendMessageState } from "@/app/auth/actions";
import { IconPackageOpen } from "@/components/icons";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/browser";
import type { ConversationMessage, ConversationThreadData } from "@/lib/data";

type MessageRow = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

function messageFromRow(row: MessageRow, currentUserId: string): ConversationMessage {
  return {
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    senderName: row.sender_id === currentUserId ? "You" : "SwapShelf member",
    senderInitials: row.sender_id === currentUserId ? "You" : "SS",
    senderAvatarUrl: null,
    createdAt: row.created_at,
    isOwn: row.sender_id === currentUserId,
  };
}

function appendMessage(messages: ConversationMessage[], message: ConversationMessage) {
  if (messages.some((existing) => existing.id === message.id)) {
    return messages;
  }

  return [...messages, message];
}

export function RealtimeMessageThread({ thread }: { thread: ConversationThreadData }) {
  const [messages, setMessages] = useState(thread.messages);
  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(sendMessageInlineAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.message) return;

    const timer = window.setTimeout(() => {
      setMessages((current) =>
        appendMessage(
          current,
          messageFromRow(
            {
              id: state.message!.id,
              body: state.message!.body,
              sender_id: state.message!.senderId,
              created_at: state.message!.createdAt,
            },
            thread.currentUserId,
          ),
        ),
      );
      formRef.current?.reset();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [state.message, thread.currentUserId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${thread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${thread.id}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((current) => appendMessage(current, messageFromRow(row, thread.currentUserId)));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [thread.currentUserId, thread.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <>
      <div className="flex flex-1 overflow-y-auto bg-background/50 px-5 py-4">
        <div className="flex min-h-full w-full flex-col justify-end space-y-3">
          {messages.length ? (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    message.isOwn
                      ? "rounded-br-md bg-green text-white"
                      : "rounded-bl-md bg-card text-foreground ring-1 ring-border"
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
          <div ref={scrollRef} />
        </div>
      </div>

      <form ref={formRef} action={formAction} className="shrink-0 border-t border-border bg-card p-4">
        <input type="hidden" name="conversation_id" value={thread.id} />
        {state.error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.error}
          </p>
        )}
        <div className="flex gap-2">
          <input
            name="body"
            type="text"
            autoComplete="off"
            disabled={!thread.canSend || pending}
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
