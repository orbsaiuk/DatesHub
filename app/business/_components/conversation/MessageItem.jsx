"use client";
import EventRequestActions from "./OrderRequestActions";
import { formatTime } from "@/lib/dateUtils";

const formatEventDate = (dateString) => {
  if (!dateString) return dateString;
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

export default function MessageItem({
  message,
  isCurrentUser,
  otherDisplayName,
  isAfterDecision,
  formatMessageTime,
  getCategoryName,
  onOrderRequestAction,
  disableOrderRequestResponse = false,
}) {
  const senderName = isCurrentUser ? "أنت" : otherDisplayName;
  const body = message.text || "";

  return (
    <div className="border rounded-lg hover:shadow-sm transition-all duration-200 bg-card">
      <div className="px-3 py-2 bg-muted/60 border-b rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{senderName}</span>
        </div>
        <span className="text-xs text-muted-foreground ms-2 whitespace-nowrap flex-shrink-0">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
      <div className="px-3 sm:px-4 py-3 space-y-2">
        {/* After decision, always render full text in body; otherwise render body when present */}
        {isAfterDecision ? (
          <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
            {message.text}
          </p>
        ) : (
          (body || message.text) && (
            <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
              {body || message.text}
            </p>
          )
        )}
        {/* Event request details when available */}
        {message.messageType === "order_request" &&
          message.orderRequestData && (
            <div className="text-sm text-foreground bg-muted/30 rounded-md p-3 mt-2">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <span className="text-muted-foreground font-medium block sm:inline">
                      تاريخ الطلب:{" "}
                    </span>
                    <span className="font-medium">
                      {formatEventDate(message.orderRequestData.deliveryDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium block sm:inline">
                      الكمية:{" "}
                    </span>
                    <span className="font-medium">
                      {message.orderRequestData.quantity.toLocaleString(
                        "ar-EG"
                      )}{" "}
                      كيلو
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium block sm:inline">
                      نوع التمور:{" "}
                    </span>
                    <span className="font-medium">
                      {getCategoryName(message.orderRequestData.category)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium block sm:inline">
                      عنوان التوصيل:{" "}
                    </span>
                    <span className="font-medium break-words">
                      {message.orderRequestData.deliveryAddress}
                    </span>
                  </div>
                </div>
                {message.orderRequestData.additionalNotes && (
                  <div className="pt-3 border-t border-muted-foreground/20">
                    <div className="text-muted-foreground font-medium mb-2">
                      الملاحظات:
                    </div>
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                      {message.orderRequestData.additionalNotes}
                    </p>
                  </div>
                )}

                {/* Show action buttons for business users if request is pending and not sent by current user */}
                {!isCurrentUser &&
                  message.orderRequestData.status === "pending" &&
                  !isAfterDecision && (
                    <EventRequestActions
                      orderRequestId={message.orderRequestData.orderRequestId}
                      onActionComplete={onOrderRequestAction}
                      disabled={disableOrderRequestResponse}
                    />
                  )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
