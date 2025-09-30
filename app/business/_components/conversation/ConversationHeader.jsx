"use client";
import { ArrowRight, Building2, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import UserProfileModal from "@/app/business/_components/messages/UserProfileModal";
import WriteUserReviewModal from "@/app/business/_components/messages/WriteUserReviewModal";

export default function ConversationHeader({ otherParticipant, onBackClick }) {
  const [openProfile, setOpenProfile] = useState(false);
  const otherDisplayName =
    otherParticipant?.displayName || otherParticipant?.name || "Unknown";
  const userIdForModal = useMemo(() => {
    if (!otherParticipant) return null;
    // When chatting with a user, prefer clerkId, else null
    if (otherParticipant.kind === "user") {
      return otherParticipant.clerkId || otherParticipant.tenantId || null;
    }
    return null;
  }, [otherParticipant]);

  const [userImageUrl, setUserImageUrl] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [userRatingCount, setUserRatingCount] = useState(0);
  const [openWriteReview, setOpenWriteReview] = useState(false);

  useEffect(() => {
    if (!userIdForModal) return;
    // Load user profile details for header (image + rating)
    fetch(`/api/users/${userIdForModal}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const u = data?.user || {};
        setUserImageUrl(u.imageUrl || "");
        setUserRating(typeof u.rating === "number" ? u.rating : null);
        setUserRatingCount(Number(u.ratingCount || 0));
      })
      .catch(() => {
        setUserImageUrl("");
        setUserRating(null);
        setUserRatingCount(0);
      });
  }, [userIdForModal]);

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBackClick}
        className="hover:bg-muted/50 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] cursor-pointer"
      >
        <ArrowRight className="h-5 w-5 sm:h-4 sm:w-4" />
      </Button>

      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-muted/80 p-1"
        onClick={() => userIdForModal && setOpenProfile(true)}
      >
        {otherParticipant?.kind === "user" && userImageUrl ? (
          <Image
            src={userImageUrl}
            alt={otherDisplayName || "Avatar"}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-background shadow-sm w-10 h-10 sm:w-10 sm:h-10 object-cover"
          />
        ) : otherParticipant?.avatar ? (
          <Image
            src={urlFor(otherParticipant.avatar).width(40).height(40).url()}
            alt={otherDisplayName || "Avatar"}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-background shadow-sm w-10 h-10 sm:w-10 sm:h-10"
          />
        ) : (
          <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-background shadow-sm">
            {otherParticipant?.kind === "company" ? (
              <Building2 className="h-5 w-5 text-muted-foreground" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold truncate">
            {otherDisplayName}
          </h2>
          {otherParticipant?.kind === "user" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-foreground/80">
                <Star
                  className={`${typeof userRating === "number" ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} h-3.5 w-3.5`}
                />
                {typeof userRating === "number"
                  ? `${userRating.toFixed(2)} / 5`
                  : "لا توجد تقييمات"}
                <span className="text-muted-foreground">
                  · {userRatingCount}
                </span>
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenWriteReview(true);
                }}
              >
                اكتب تقييماً
              </Button>
            </div>
          )}
        </div>
      </div>
      {userIdForModal && (
        <UserProfileModal
          open={openProfile}
          onOpenChange={setOpenProfile}
          userId={userIdForModal}
        />
      )}
      {userIdForModal && (
        <WriteUserReviewModal
          open={openWriteReview}
          onOpenChange={setOpenWriteReview}
          userId={userIdForModal}
          onSubmitted={({ rating, ratingCount }) => {
            setUserRating(rating);
            setUserRatingCount(ratingCount);
          }}
        />
      )}
    </div>
  );
}
