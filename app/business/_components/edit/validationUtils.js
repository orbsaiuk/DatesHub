/**
 * Validation utilities for business edit forms
 */

/**
 * Check if a location object is completely empty (no data at all)
 */
export function isLocationEmpty(location) {
    if (!location) return true;

    const values = [
        location.address,
        location.city,
        location.region,
        location.country,
        location.zipCode,
        location.geo?.lat,
        location.geo?.lng
    ];

    return !values.some(val => val !== null && val !== undefined && val !== "");
}

/**
 * Check if a location object is complete (has all required fields)
 */
export function isLocationComplete(location) {
    if (!location) return false;

    const address = (location.address || "").trim();
    const city = (location.city || "").trim();
    const region = (location.region || "").trim();
    const country = (location.country || "").trim();
    const zipCode = (location.zipCode || "").trim();
    const hasGeo = location.geo &&
        Number.isFinite(Number(location.geo.lat)) &&
        Number.isFinite(Number(location.geo.lng));

    return !!(address && city && region && country && zipCode && hasGeo);
}

/**
 * Check if a location has some data but is incomplete
 */
export function isLocationIncomplete(location) {
    return !isLocationEmpty(location) && !isLocationComplete(location);
}

/**
 * Validate locations array and return validation result
 */
export function validateLocations(locations, requireAtLeastOne = false) {
    if (!Array.isArray(locations)) {
        return { isValid: true, message: "" };
    }

    // Check for incomplete locations
    const incompleteLocations = locations.filter(isLocationIncomplete);
    if (incompleteLocations.length > 0) {
        return {
            isValid: false,
            message: "يرجى إكمال جميع حقول المواقع المطلوبة أو حذف المواقع غير المكتملة."
        };
    }

    // Check if there are any locations with data but none are complete
    const locationsWithData = locations.filter(loc => !isLocationEmpty(loc));
    const completeLocations = locations.filter(isLocationComplete);

    if (locationsWithData.length > 0 && completeLocations.length === 0) {
        return {
            isValid: false,
            message: "يرجى إضافة موقع واحد مكتمل على الأقل."
        };
    }

    // Check if at least one location is required
    if (requireAtLeastOne && completeLocations.length === 0) {
        return {
            isValid: false,
            message: "يرجى إضافة موقع واحد على الأقل."
        };
    }

    return { isValid: true, message: "" };
}

/**
 * Get user-friendly validation messages for locations
 */
export function getLocationValidationMessage(locations) {
    const validation = validateLocations(locations);
    return validation.message;
}

/**
 * Get detailed validation errors for a specific location
 */
export function getLocationFieldErrors(location) {
    if (!location || isLocationEmpty(location)) {
        return {};
    }

    const errors = {};

    if (!(location.address || "").trim()) {
        errors.address = "العنوان مطلوب";
    }

    if (!(location.city || "").trim()) {
        errors.city = "المدينة مطلوبة";
    }

    if (!(location.region || "").trim()) {
        errors.region = "المنطقة مطلوبة";
    }

    if (!(location.country || "").trim()) {
        errors.country = "البلد مطلوب";
    }

    if (!(location.zipCode || "").trim()) {
        errors.zipCode = "الرمز البريدي مطلوب";
    }

    if (!location.geo || !Number.isFinite(Number(location.geo.lat)) || !Number.isFinite(Number(location.geo.lng))) {
        errors.geo = "الموقع على الخريطة مطلوب";
    }

    return errors;
}

/**
 * Check if location has any validation errors
 */
export function hasLocationErrors(location) {
    const errors = getLocationFieldErrors(location);
    return Object.keys(errors).length > 0;
}