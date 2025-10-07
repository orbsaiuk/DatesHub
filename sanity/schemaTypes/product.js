import { defineField, defineType } from "sanity";

export default defineType({
    name: "product",
    title: "Product",
    type: "document",
    fields: [
        defineField({
            name: "tenantType",
            title: "Tenant Type",
            type: "string",
            options: {
                list: [
                    { title: "Company", value: "company" },
                    { title: "Supplier", value: "supplier" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "tenantId",
            title: "Tenant ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "array",
            of: [{ type: "block" }],
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "price",
            title: "Price",
            type: "number",
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: "quantity",
            title: "Quantity (kg)",
            type: "number",
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: "currency",
            title: "Currency",
            type: "string",
            options: {
                list: [
                    { title: "Saudi Riyal (ر.س)", value: "SAR" },
                    { title: "UAE Dirham (د.إ)", value: "AED" },
                    { title: "Kuwaiti Dinar (د.ك)", value: "KWD" },
                    { title: "Qatari Riyal (ر.ق)", value: "QAR" },
                    { title: "Bahraini Dinar (د.ب)", value: "BHD" },
                    { title: "Omani Rial (ر.ع)", value: "OMR" },
                    { title: "Jordanian Dinar (د.أ)", value: "JOD" },
                    { title: "Lebanese Pound (ل.ل)", value: "LBP" },
                    { title: "Egyptian Pound (ج.م)", value: "EGP" },
                    { title: "Iraqi Dinar (د.ع)", value: "IQD" },
                    { title: "Syrian Pound (ل.س)", value: "SYP" },
                    { title: "Yemeni Rial (ر.ي)", value: "YER" },
                ],
            },
            initialValue: "SAR",
        }),
        defineField({
            name: "weightUnit",
            title: "Weight Unit",
            type: "string",
            options: {
                list: [
                    { title: "Kilogram (كغ)", value: "kg" },
                    { title: "Gram (جم)", value: "g" },
                ],
            },
            initialValue: "kg",
        }),

        defineField({
            name: "company",
            title: "Company",
            type: "reference",
            to: [{ type: "company" }],
        }),
        defineField({
            name: "supplier",
            title: "Supplier",
            type: "reference",
            to: [{ type: "supplier" }],
        }),
    ],
    preview: {
        select: {
            title: "title",
            media: "image",
            company: "company.name",
            supplier: "supplier.name",
        },
        prepare(selection) {
            const { title, media, company, supplier } = selection;
            const tenant = company || supplier;
            return {
                title,
                subtitle: tenant ? `${tenant}` : "No tenant",
                media,
            };
        },
    },
});