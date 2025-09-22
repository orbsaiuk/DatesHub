"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  User,
  Building2,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

export default function EventRequestMessage({
  message,
  isFromMe,
  viewerTenantType,
  onUpdate,
}) {
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const eventData = message.eventRequestData;
  const canRespond =
    !isFromMe &&
    viewerTenantType === "company" &&
    eventData?.status === "pending";

  const handleResponse = async (action) => {
    if (!response.trim() && action === "declined") {
      alert("Please provide a reason for declining the request.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/event-requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventRequestId: eventData.eventRequestId,
          action,
          companyResponse: response,
        }),
      });

      if (res.ok) {
        setIsResponding(false);
        setResponse("");
        onUpdate?.();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to respond to event request");
      }
    } catch (error) {
      console.error("Error responding to event request:", error);
      alert("Failed to respond to event request");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <Check className="h-3 w-3" />;
      case "declined":
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex gap-2 md:gap-3 lg:gap-4 group touch-manipulation max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {message.sender?.kind === "user" ? (
          <div className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center ring-2 ring-blue-500/10 shadow-sm">
            <User className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-blue-600" />
          </div>
        ) : (
          <div className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center ring-2 ring-primary/10 shadow-sm">
            <Building2 className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-primary" />
          </div>
        )}
      </div>

      {/* Event Request Card */}
      <Card className="flex-1 min-w-0 shadow-sm border border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Event Request
            </CardTitle>
            <Badge
              variant="outline"
              className={cn("text-xs", getStatusColor(eventData?.status))}
            >
              {getStatusIcon(eventData?.status)}
              <span className="ml-1 capitalize">{eventData?.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Client:</span>
              <span>{eventData?.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{formatDate(eventData?.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>{eventData?.eventTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Guests:</span>
              <span>{eventData?.numberOfGuests}</span>
            </div>
            {eventData?.category && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {eventData.category}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Service:</span>
              <span>{eventData?.serviceRequired}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{eventData?.eventLocation}</span>
            </div>
          </div>

          {/* Event Description */}
          {eventData?.eventDescription && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description:</Label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {eventData.eventDescription}
              </p>
            </div>
          )}

          {/* Company Response */}
          {eventData?.companyResponse && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Response:</Label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {eventData.companyResponse}
              </p>
            </div>
          )}

          {/* Action Buttons for Company */}
          {canRespond && (
            <div className="space-y-3 pt-2 border-t">
              {!isResponding ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsResponding(true)}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsResponding(true)}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Response Message:</Label>
                    <Textarea
                      placeholder="Enter your response message..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResponse("accepted")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                      {loading ? "Processing..." : "Accept Request"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleResponse("declined")}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 cursor-pointer"
                    >
                      {loading ? "Processing..." : "Decline Request"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsResponding(false);
                        setResponse("");
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
