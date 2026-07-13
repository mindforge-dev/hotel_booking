"use client";

import { useState } from "react";
import { useSupportMessages, useSendMessage } from "@/hooks/user/useSupport";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Headphones,
  Loader2,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
};

const faqs = [
  {
    q: "How do I cancel a booking?",
    a: "Go to My Bookings, find the booking you want to cancel, and click 'Cancel Booking'. Refunds are subject to our cancellation policy.",
  },
  {
    q: "Can I modify my booking dates?",
    a: "Currently, booking dates cannot be modified after confirmation. Please cancel and rebook with the new dates.",
  },
  {
    q: "How do loyalty points work?",
    a: "You earn points for completing bookings, writing reviews, and referring friends. Points can be accumulated to reach higher membership tiers.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit/debit cards and various online payment methods. Payment is processed securely at checkout.",
  },
];

export default function SupportPage() {
  const { data: messages = [], isLoading } = useSupportMessages();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      await sendMessage.mutateAsync({ subject, message });
      toast({ title: "Message Sent", description: "We'll get back to you soon." });
      setSubject("");
      setMessage("");
    } catch {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your bookings and account</p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-center justify-between py-3 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <p className="text-sm text-muted-foreground pb-3">{faq.a}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Send Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={sendMessage.isPending}>
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Past Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-0 divide-y">
              {messages.map((msg) => {
                const config = statusConfig[msg.status] || statusConfig.OPEN;
                const StatusIcon = config.icon;

                return (
                  <div key={msg.id} className="py-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium">{msg.subject}</h4>
                      <Badge className={`${config.color} text-xs`} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Headphones className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No support messages yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
