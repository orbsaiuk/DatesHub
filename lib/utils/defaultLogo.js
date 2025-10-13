/**
 * Get default logo URL for tenants without a custom logo
 * @param {string} tenantName - Name of the tenant
 * @returns {string} Default logo URL
 */
export function getDefaultLogoUrl(tenantName = "") {
    // Using a simple gradient placeholder with initials
    // You can replace this with an actual default logo image path
    const initial = tenantName?.charAt(0)?.toUpperCase() || "?";

    // Option 1: Use a placeholder service (ui-avatars.com)
    const encodedName = encodeURIComponent(tenantName || "Business");
    return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=3b82f6&color=ffffff&bold=true&format=svg`;

    // Option 2: Use a local default image (uncomment and add image to public folder)
    // return "/images/default-logo.png";
}

/**
 * Get logo URL with fallback to default
 * @param {object} logo - Sanity image object
 * @param {string} tenantName - Name of the tenant
 * @param {function} urlFor - Sanity urlFor function
 * @returns {string} Logo URL
 */
export function getLogoUrl(logo, tenantName, urlFor) {
    if (logo?.asset) {
        try {
            return urlFor(logo).width(200).height(200).fit("crop").url();
        } catch (e) {
            console.warn("Failed to generate logo URL:", e);
        }
    }

    return getDefaultLogoUrl(tenantName);
}
