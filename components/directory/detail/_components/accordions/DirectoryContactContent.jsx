import { Button } from "@/components/ui/button";

export default function DirectoryContactContent({ company }) {
  return (
    <div className="rounded-md border p-4 sm:p-5 bg-white">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded bg-gray-200" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            صندوق الوارد للتواصل مع {company?.name}
          </p>
          <p className="text-xs text-muted-foreground leading-6">
            إذا لم تكن متأكدًا تمامًا مما تحتاجه هنا، أرسل لهذه الشركة رسالة
            مخصصة. يمكنك التحدث عن احتياجات مشروعك، والسعر، والجدول الزمني للبدء
            في مشروعك.
          </p>
          <form className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:items-center">
            <Button
              type="submit"
              className="text-gray-500 w-fit inline-flex items-center justify-center rounded-md border bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10 active:scale-[0.99] transition cursor-pointer"
            >
              إرسال رسالة
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
