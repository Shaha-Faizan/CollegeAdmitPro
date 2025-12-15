import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { ConversationDoc, MessageDoc } from "@shared/schema";

// Get or create guest ID for unauthenticated users
function getGuestId(): string {
  let guestId = localStorage.getItem("chat_guest_id");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("chat_guest_id", guestId);
  }
  return guestId;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => setIsGuest(!res.ok))
      .catch(() => setIsGuest(true));
  }, []);

  const chatEndpoint = isGuest === true ? "/api/chat/guest" : "/api/chat";
  const isAuthCheckComplete = isGuest !== null;

  // Fetch conversations
  const { data: conversations = [] } = useQuery<ConversationDoc[]>({
    queryKey: [chatEndpoint + "/conversations"],
    enabled: isOpen && isAuthCheckComplete,
    queryFn: async () => {
      try {
        const response = await fetch(`${chatEndpoint}/conversations${isGuest === true ? `?guestId=${getGuestId()}` : ""}`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
  });

  // Fetch messages
  const { data: messages = [], refetch: refetchMessages } = useQuery<MessageDoc[]>({
    queryKey: [chatEndpoint + "/messages", selectedConversation],
    enabled: !!selectedConversation && isAuthCheckComplete,
    refetchInterval: 2000,
    queryFn: async () => {
      try {
        const response = await fetch(
          `${chatEndpoint}/messages/${selectedConversation}${isGuest === true ? `?guestId=${getGuestId()}` : ""}`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
  });

  // Create conversation
  const createConversationMutation = useMutation({
    mutationFn: async (subject: string) => {
      if (isGuest === null) throw new Error("Waiting for authentication check to complete...");

      const endpoint = isGuest === true ? "/api/chat/guest" : "/api/chat";
      const body = isGuest === true ? { subject, guestId: getGuestId() } : { subject };

      const response = await fetch(`${endpoint}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create conversation");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      setSelectedConversation(data._id);
      queryClient.invalidateQueries({ queryKey: [chatEndpoint + "/conversations"] });
    },
    onError: (error: any) => {
      console.error("Create conversation error:", error);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversation || !messageText.trim()) return;
      if (isGuest === null) throw new Error("Waiting for authentication check to complete...");

      const endpoint = isGuest === true ? "/api/chat/guest" : "/api/chat";
      const body = isGuest === true
        ? { conversationId: selectedConversation, message: messageText, guestId: getGuestId() }
        : { conversationId: selectedConversation, message: messageText };

      const response = await fetch(`${endpoint}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Floating open button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        data-testid="button-chat-open"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
   <div className="fixed bottom-4 right-4 w-80 h-80 sm:w-96 sm:h-96 z-40 max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]">
  <Card className="h-full shadow-xl rounded-lg overflow-hidden flex flex-col">
    {/* Header always visible */}
    <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
      <CardTitle className="text-lg">Support Chat</CardTitle>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(false)}
        data-testid="button-chat-close"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>

    {/* Body */}
    <CardContent className="flex-1 flex flex-col gap-3 pb-3">
      {selectedConversation ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
            className="self-start"
            data-testid="button-back-to-conversations"
          >
            ← Back
          </Button>
          {/* Messages */}
          <ScrollArea className="flex-1 rounded-md border p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id.toString()}
                  className={`flex ${msg.senderId === "system" ? "justify-center" : ""}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-md text-sm ${
                    msg.senderId === "system"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessageMutation.mutate();
                }
              }}
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
            <Button
              size="icon"
              onClick={() => sendMessageMutation.mutate()}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        // Conversation list / new conversation button
        <div className="space-y-3 flex-1 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Select a conversation or start a new one
          </p>
          {conversations.length === 0 ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => createConversationMutation.mutate("New Support Request")}
              disabled={createConversationMutation.isPending || !isAuthCheckComplete}
            >
              + Start New Conversation
            </Button>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv._id.toString()}
                  onClick={() => setSelectedConversation(conv._id.toString())}
                  className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{conv.subject}</span>
                    <Badge variant="secondary" className="text-xs">
                      {conv.status}
                    </Badge>
                  </div>
                </button>
              ))}
              <Button
                variant="outline"
                className="w-full justify-start mt-2"
                onClick={() => createConversationMutation.mutate("New Support Request")}
                disabled={createConversationMutation.isPending || !isAuthCheckComplete}
              >
                + New Conversation
              </Button>
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
</div>

  );
}
