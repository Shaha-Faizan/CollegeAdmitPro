import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";

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

  useEffect(() => {
    // Check if user is authenticated by trying to access auth endpoint
    fetch("/api/auth/me")
      .then((res) => setIsGuest(!res.ok))
      .catch(() => setIsGuest(true));
  }, []);

  const chatEndpoint = isGuest === true ? "/api/chat/guest" : "/api/chat";
  const isAuthCheckComplete = isGuest !== null;

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: [chatEndpoint + "/conversations"],
    enabled: isOpen && isAuthCheckComplete,
    queryFn: async () => {
      try {
        const response = await fetch(`${chatEndpoint}/conversations${isGuest === true ? `?guestId=${getGuestId()}` : ""}`, {
          method: "GET",
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [chatEndpoint + "/messages", selectedConversation],
    enabled: !!selectedConversation && isAuthCheckComplete,
    refetchInterval: 2000,
    queryFn: async () => {
      try {
        const response = await fetch(`${chatEndpoint}/messages/${selectedConversation}${isGuest === true ? `?guestId=${getGuestId()}` : ""}`, {
          method: "GET",
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (subject: string) => {
      // Prevent mutation if auth check isn't complete
      if (isGuest === null) {
        throw new Error("Waiting for authentication check to complete...");
      }
      
      const endpoint = isGuest === true ? "/api/chat/guest" : "/api/chat";
      const body = isGuest === true
        ? { subject, guestId: getGuestId() }
        : { subject };
      
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
      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: [chatEndpoint + "/conversations"] });
    },
    onError: (error: any) => {
      console.error("Create conversation error:", error);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversation || !messageText.trim()) return;
      
      // Prevent mutation if auth check isn't complete
      if (isGuest === null) {
        throw new Error("Waiting for authentication check to complete...");
      }
      
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
      <Card className="h-full shadow-xl rounded-lg overflow-hidden">
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

        <CardContent className="flex flex-col gap-3 h-full pb-3">
          {!selectedConversation ? (
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
                  data-testid="button-new-conversation"
                >
                  + Start New Conversation
                </Button>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors"
                      data-testid={`button-conversation-${conv.id}`}
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
                    data-testid="button-new-conversation-2"
                  >
                    + New Conversation
                  </Button>
                </div>
              )}
            </div>
          ) : (
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
              <ScrollArea className="flex-1 rounded-md border p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === "system" ? "justify-center" : ""}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-md text-sm ${
                          msg.senderId === "system"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
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
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  onClick={() => sendMessageMutation.mutate()}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
