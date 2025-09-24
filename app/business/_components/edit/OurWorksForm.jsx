"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Image as ImageIcon, Pencil } from "lucide-react";
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

export default function OurWorksForm({ form, updateField, workErrors }) {
  useEffect(() => {
    const arr = Array.isArray(form.ourWorks) ? form.ourWorks : [];
    if (arr.length === 0) return;
    const needsId = arr.some((w) => !w || !w.id);
    if (!needsId) return;
    const withIds = arr.map((w, i) =>
      w && w.id
        ? w
        : {
            ...w,
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${i}`,
          }
    );
    updateField("ourWorks", withIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const removeWork = (index) => {
    const newWorks = form.ourWorks.filter((_, i) => i !== index);
    updateField("ourWorks", newWorks);
  };

  // Local UI state for add/edit in a dialog
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(null);
  const [draftErrors, setDraftErrors] = useState({});

  const workCategories = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Anniversary",
    "Graduation",
    "Product Launch",
    "Conference",
    "Trade Show",
    "Gala",
    "Other",
  ];

  const getErrorFor = (index, field) => {
    if (!Array.isArray(workErrors)) return null;
    const per = workErrors[index];
    return per ? per[field] || null : null;
  };

  const startAdd = () => {
    setEditingIndex(null);
    setDraft({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`,
      title: "",
      description: "",
      images: [],
    });
    setOpen(true);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setDraft({ ...(form.ourWorks?.[index] || {}) });
    setOpen(true);
  };

  const saveDraft = () => {
    if (!draft) return;

    // Validate required fields
    const errors = {};
    if (!draft.title?.trim()) {
      errors.title = "العنوان مطلوب";
    }
    if (!draft.description?.trim()) {
      errors.description = "الوصف مطلوب";
    }
    if (!draft.images?.length) {
      errors.images = "مطلوب صورة واحدة على الأقل";
    }

    // If there are errors, update state and prevent save
    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      return;
    }

    // Clear any previous errors
    setDraftErrors({});

    // Proceed with saving
    const works = Array.isArray(form.ourWorks) ? [...form.ourWorks] : [];
    if (editingIndex === null || editingIndex === undefined) {
      updateField("ourWorks", [...works, draft]);
    } else {
      works[editingIndex] = draft;
      updateField("ourWorks", works);
    }
    setOpen(false);
    setDraft(null);
    setEditingIndex(null);
  };

  const resolveImageUrl = (img) => {
    if (!img) return null;
    // File (just selected, not uploaded yet)
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

  const renderImagesGrid = (imgs, title) => {
    const count = imgs.length;
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md bg-muted relative">
        {count === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        ) : count === 1 ? (
          <div className="absolute inset-0">
            <Image
              src={imgs[0]}
              alt={title || "صورة العمل"}
              className="object-contain"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : count === 2 ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-1">
            {imgs.map((src, i) => (
              <div key={i} className="relative">
                <Image
                  src={src}
                  alt={`${title || "Work image"} - ${i + 1}`}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        ) : count === 3 ? (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1">
            <div className="relative col-span-2 row-span-2">
              <Image
                src={imgs[0]}
                alt={`${title || "Work image"} - 1`}
                className="object-contain"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative">
              <Image
                src={imgs[1]}
                alt={`${title || "Work image"} - 2`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative">
              <Image
                src={imgs[2]}
                alt={`${title || "Work image"} - 3`}
                className="object-contain"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
            {imgs.slice(0, 4).map((src, i) => (
              <div key={i} className="relative">
                <Image
                  src={src}
                  alt={`${title || "Work image"} - ${i + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="section-our-works" className="space-y-5 sm:space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={startAdd}
          className="cursor-pointer px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة مثال عمل
        </Button>
      </div>

      {/* Works as Cards */}
      {form.ourWorks?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {form.ourWorks.map((work, index) => {
            const imgsResolved = (Array.isArray(work.images) ? work.images : [])
              .slice(0, 4)
              .map((i) => resolveImageUrl(i))
              .filter(Boolean);
            return (
              <Card key={work.id || index} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {work.title || "عمل بدون عنوان"}
                      </CardTitle>
                      <CardDescription>
                        {(work.description || "").length > 120
                          ? `${work.description.slice(0, 120)}...`
                          : work.description || "لم يتم تقديم وصف"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(index)}
                        aria-label="Edit work"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label="Remove work"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove Work Example
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد أنك تريد إزالة مثال العمل هذا؟ لا
                              يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeWork(index)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              إزالة
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderImagesGrid(imgsResolved, work.title)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            لم يتم إضافة أمثلة عمل حتى الآن
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            أضف مثال عملك الأول لعرض خبرتك
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex === null ? "إضافة مثال عمل" : "تحرير مثال عمل"}
            </DialogTitle>
            <DialogDescription>
              قدم التفاصيل والصور لمثال العمل هذا.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm sm:text-base font-medium">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={draft.title}
                  onChange={(e) => {
                    setDraft({ ...draft, title: e.target.value });
                    if (draftErrors.title) {
                      setDraftErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="e.g., Sarah & John's Wedding, Tech Conference 2024"
                  className="mt-2"
                />
                {draftErrors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {draftErrors.title}
                  </p>
                )}
                {editingIndex !== null && getErrorFor(editingIndex, "title") ? (
                  <div className="text-xs text-destructive mt-1">
                    {getErrorFor(editingIndex, "title")}
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
                      setDraftErrors((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
                    }
                  }}
                  placeholder="Describe the event, challenges overcome, and outcomes achieved..."
                  className="mt-2 min-h-[100px]"
                />
                {draftErrors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {draftErrors.description}
                  </p>
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
                  صور الحدث <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <ImageUploader
                    image={draft.images}
                    onImageChange={(newImages) => {
                      setDraft({ ...draft, images: newImages });
                      if (draftErrors.images) {
                        setDraftErrors((prev) => ({
                          ...prev,
                          images: undefined,
                        }));
                      }
                    }}
                    placeholder="أضف صور الحدث"
                    multiple={true}
                    maxFiles={4}
                    maxSizeMB={5}
                  />
                  {draftErrors.images && (
                    <p className="text-sm text-destructive mt-1">
                      {draftErrors.images}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setDraft(null);
                setEditingIndex(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={saveDraft}
              disabled={
                !draft?.title?.trim() ||
                !draft?.description?.trim() ||
                !draft?.images?.length
              }
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
