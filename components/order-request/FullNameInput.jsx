"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import OrderRequestInput from "./OrderRequestInput";
import { User } from "lucide-react";

export default function FullNameInput({ register, setValue, error, hasValue }) {
    const { user } = useUser();

    useEffect(() => {
        if (user && (user.firstName || user.lastName)) {
            const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            if (fullName) {
                setValue("fullName", fullName);
            }
        }
    }, [user, setValue]);

    return (
        <OrderRequestInput
            name="fullName"
            label="الاسم الكامل"
            type="text"
            placeholder={
                user?.firstName || user?.lastName
                    ? `تم التعبئة تلقائيا من حسابك: ${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "أدخل الاسم الكامل فقط"
            }
            icon={<User size={16} />}
            required={true}
            helperText={
                user?.firstName || user?.lastName
                    ? "✓ تم التعبئة تلقائيا من حسابك. يمكنك تعديله إذا لزم الأمر."
                    : null
            }
            error={error}
            hasValue={hasValue}
            register={register}
        />
    );
}
