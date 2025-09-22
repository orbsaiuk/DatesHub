"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trophy, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

// Local cache for File -> object URL preview to avoid recreating blob URLs every render
const _previewUrlCache = new Map();
if (typeof window !== "undefined") {
  // Use pagehide to stay compatible with back/forward cache (bfcache)
  window.addEventListener(
    "pagehide",
    () => {
      _previewUrlCache.forEach((u) => URL.revokeObjectURL(u));
      _previewUrlCache.clear();
    },
    { capture: true }
  );
}

export default function AwardsForm({ form, updateField, awardErrors }) {
  useEffect(() => {
    const arr = Array.isArray(form.awards) ? form.awards : [];
    if (arr.length === 0) return;
    const needsId = arr.some((a) => !a || !a.id);
    if (!needsId) return;
    const withIds = arr.map((a, i) =>
      a && a.id
        ? a
        : {
            ...a,
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${i}`,
          }
    );
    updateField("awards", withIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const removeAward = (index) => {
    const newAwards = form.awards.filter((_, i) => i !== index);
    updateField("awards", newAwards);
  };

  // Local UI state for add/edit in a dialog
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // null means adding
  const [draft, setDraft] = useState(null);
  const [draftErrors, setDraftErrors] = useState({});

  const startAdd = () => {
    setEditingIndex(null);
    setDraft({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`,
      name: "",
      description: "",
      image: null,
    });
    setOpen(true);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setDraft({ ...(form.awards?.[index] || {}) });
    setOpen(true);
  };

  const saveDraft = () => {
    if (!draft) return;
    
    // Validate required fields
    const errors = {};
    if (!draft.name?.trim()) {
      errors.name = 'Award name is required';
    }
    if (!draft.description?.trim()) {
      errors.description = 'Description is required';
    }
    if (!draft.image) {
      errors.image = 'An image is required';
    }
    
    // If there are errors, update state and prevent save
    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setDraftErrors({});
    
    // Proceed with saving
    const awards = Array.isArray(form.awards) ? [...form.awards] : [];
    if (editingIndex === null || editingIndex === undefined) {
      updateField("awards", [...awards, draft]);
    } else {
      awards[editingIndex] = draft;
      updateField("awards", awards);
    }
    setOpen(false);
    setDraft(null);
    setEditingIndex(null);
  };

  const getErrorFor = (index, field) => {
    if (!Array.isArray(awardErrors)) return null;
    const per = awardErrors[index];
    return per ? per[field] || null : null;
  };

  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (typeof File !== "undefined" && img instanceof File) {
      if (!_previewUrlCache.has(img)) {
        try {
          _previewUrlCache.set(img, URL.createObjectURL(img));
        } catch (e) {
          return null;
        }
      }
      return _previewUrlCache.get(img);
    }
    if (typeof img === "string") return img;
    if (typeof img === "object" && img.url) return img.url;
    try {
      return urlFor(img).fit("crop").url();
    } catch (e) {
      return null;
    }
  };

  return (
    <div id="section-awards" className="space-y-5 sm:space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={startAdd}
          className="cursor-pointer px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {/* Awards as Cards */}
      {form.awards?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {form.awards.map((award, index) => {
            const img = resolveImageUrl(award?.image);
            return (
              <Card key={award.id || index} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {award.name || "Untitled Award"}
                      </CardTitle>
                      <CardDescription>
                        {(award.description || "").length > 120
                          ? `${award.description.slice(0, 120)}...`
                          : award.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(index)}
                        aria-label="Edit award"
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive cursor-pointer"
                            aria-label="Remove award"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Award</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this award? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeAward(index)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted flex items-center justify-center relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={award.name || "Award"}
                        className="object-contain h-full w-full"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={
                          typeof img === "string" &&
                          (img.startsWith("blob:") || img.startsWith("data:"))
                        }
                      />
                    ) : (
                      <Trophy className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No awards added yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first award to showcase your achievements
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setDraft(null);
            setEditingIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex === null ? "Add Award" : "Edit Award"}
            </DialogTitle>
            <DialogDescription>
              Provide the award details below. Changes are saved when you click
              Save.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm sm:text-base font-medium">
                  Award Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={draft.name}
                  onChange={(e) => {
                    setDraft({ ...draft, name: e.target.value });
                    if (draftErrors.name) {
                      setDraftErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="e.g., Best Event Planner 2024, Excellence in Service"
                  className="mt-2"
                />
                {draftErrors.name && (
                  <p className="text-sm text-destructive mt-1">{draftErrors.name}</p>
                )}
                {editingIndex !== null && getErrorFor(editingIndex, "name") ? (
                  <div className="text-xs text-destructive mt-1">
                    {getErrorFor(editingIndex, "name")}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm sm:text-base font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => {
                    setDraft({ ...draft, description: e.target.value });
                    if (draftErrors.description) {
                      setDraftErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Describe what this award recognizes, criteria, and significance..."
                  className="mt-2 min-h-[100px]"
                />
                {draftErrors.description && (
                  <p className="text-sm text-destructive mt-1">{draftErrors.description}</p>
                )}
                {editingIndex !== null &&
                getErrorFor(editingIndex, "description") ? (
                  <div className="text-xs text-destructive mt-1">
                    {getErrorFor(editingIndex, "description")}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm sm:text-base font-medium">
                  Award Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <ImageUploader
                    image={draft.image}
                    onImageChange={(newImage) => {
                      setDraft({ ...draft, image: newImage });
                      if (draftErrors.image) {
                        setDraftErrors(prev => ({ ...prev, image: undefined }));
                      }
                    }}
                    placeholder="Add award image"
                    maxSizeMB={5}
                  />
                  {draftErrors.image && (
                    <p className="text-sm text-destructive mt-1">{draftErrors.image}</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setDraft(null);
                setEditingIndex(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveDraft} 
              className="cursor-pointer"
              disabled={!draft?.name?.trim() || !draft?.description?.trim() || !draft?.image}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
