import { z } from "zod";

export const CreateUserConversationSchema = z.object({
  companyTenantId: z.string().min(1).max(200),
});

export const CreateBusinessConversationSchema = z.object({
  tenantType: z.enum(["company", "supplier"]),
  tenantId: z.string().min(1).max(200),
  counterpartType: z.enum(["company", "supplier"]),
  counterpartTenantId: z.string().min(1).max(200),
});

export const SendMessageSchema = z.object({
  text: z.string().trim().min(1, "الرسالة تتطلب نصاً").max(5000),
});
