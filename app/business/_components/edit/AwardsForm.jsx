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
      errors.name = "اسم الجائزة مطلوب";
    }
    if (!draft.description?.trim()) {
      errors.description = "الوصف مطلوب";
    }
    if (!draft.image) {
      errors.image = "الصورة مطلوبة";
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
          <Plus className="h-4 w-4 me-2" />
          إضافة جائزة
        </Button>
      </div>

      {/* Awards as Cards */}
      {form.awards?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {form.awards.map((award, index) => {
            const img = resolveImageUrl(award?.image);
            return (
              <Card key={award.id || index} className="flex flex-col" dir="rtl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-right flex-1">
                      <CardTitle className="text-base text-right">
                        {award.name || "جائزة بدون عنوان"}
                      </CardTitle>
                      <CardDescription className="text-right">
                        {(award.description || "").length > 120
                          ? `${award.description.slice(0, 120)}...`
                          : award.description || "لا يوجد وصف"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(index)}
                        aria-label="تحرير الجائزة"
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
                            aria-label="إزالة الجائزة"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>إزالة الجائزة</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد أنك تريد إزالة هذه الجائزة؟ لا يمكن
                              التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeAward(index)}
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
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted flex items-center justify-center relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={award.name || "جائزة"}
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
          <p className="text-muted-foreground">لم يتم إضافة جوائز حتى الآن</p>
          <p className="text-sm text-muted-foreground mt-1">
            أضف جائزتك الأولى لعرض إنجازاتك
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
            <DialogTitle className="text-center">
              {editingIndex === null ? "إضافة جائزة" : "تحرير جائزة"}
            </DialogTitle>
            <DialogDescription className="text-center">
              قدم تفاصيل الجائزة أدناه. يتم حفظ التغييرات عند الضغط على حفظ.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4" dir="rtl">
              <div>
                <label className="text-sm sm:text-base font-medium">
                  اسم الجائزة <span className="text-red-500">*</span>
                </label>
                <Input
                  value={draft.name}
                  onChange={(e) => {
                    setDraft({ ...draft, name: e.target.value });
                    if (draftErrors.name) {
                      setDraftErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="مثال: أفضل منظم فعاليات 2024، التميز في الخدمة"
                  className="mt-2 text-right"
                  dir="rtl"
                />
                {draftErrors.name && (
                  <p className="text-sm text-destructive mt-1 text-right">
                    {draftErrors.name}
                  </p>
                )}
                {editingIndex !== null && getErrorFor(editingIndex, "name") ? (
                  <div className="text-xs text-destructive mt-1 text-right">
                    {getErrorFor(editingIndex, "name")}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm sm:text-base font-medium">
                  الوصف <span className="text-red-500">*</span>
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
                  placeholder="اوصف ما تعترف به هذه الجائزة والمعايير والأهمية..."
                  className="mt-2 min-h-[100px] text-right"
                  dir="rtl"
                />
                {draftErrors.description && (
                  <p className="text-sm text-destructive mt-1 text-right">
                    {draftErrors.description}
                  </p>
                )}
                {editingIndex !== null &&
                getErrorFor(editingIndex, "description") ? (
                  <div className="text-xs text-destructive mt-1 text-right">
                    {getErrorFor(editingIndex, "description")}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm sm:text-base font-medium">
                  صورة الجائزة <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <ImageUploader
                    image={draft.image}
                    onImageChange={(newImage) => {
                      setDraft({ ...draft, image: newImage });
                      if (draftErrors.image) {
                        setDraftErrors((prev) => ({
                          ...prev,
                          image: undefined,
                        }));
                      }
                    }}
                    placeholder="أضف صورة الجائزة"
                    maxSizeMB={5}
                  />
                  {draftErrors.image && (
                    <p className="text-sm text-destructive mt-1 text-right">
                      {draftErrors.image}
                    </p>
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
              إلغاء
            </Button>
            <Button
              onClick={saveDraft}
              className="cursor-pointer"
              disabled={
                !draft?.name?.trim() ||
                !draft?.description?.trim() ||
                !draft?.image
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
