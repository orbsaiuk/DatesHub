
export function getCompanyTypeLabel(companyType) {
    const labels = {
        "online-store": "متجر الكتروني",
        "dates-shop": "محل تمور",
        "distributor": "موزع",
    };
    return labels[companyType] || companyType;
}

export function getSupplierTypeLabel(supplierType) {
    const labels = {
        "dates-factory": "مصنع تمور",
        "packaging-factory": "مصنع تعبئة",
        "wrapping-factory": "مصنع تغليف",
        "farm": "مزرعة",
        "wholesaler": "تاجر جملة",
        "exporter": "مصدر",
    };
    return labels[supplierType] || supplierType;
}

export function getTenantTypeLabel(entityType, typeValue) {
    if (!typeValue) return null;

    if (entityType === "company") {
        return getCompanyTypeLabel(typeValue);
    } else if (entityType === "supplier") {
        return getSupplierTypeLabel(typeValue);
    }

    return null;
}
