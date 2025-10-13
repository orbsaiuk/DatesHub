# Logo Optional Feature - Changes Summary

## Overview
Made tenant logos optional with automatic default logo fallback when no logo is uploaded.

## Changes Made

### 1. Schema Updates
- **sanity/schemaTypes/company.js**: Made logo field optional with description
- **sanity/schemaTypes/supplier.js**: Made logo field optional with description  
- **sanity/schemaTypes/tenantRequest.js**: Made logo field optional with description

### 2. Default Logo Utility
- **lib/utils/defaultLogo.js**: Created utility functions
  - `getDefaultLogoUrl(tenantName)`: Generates default logo using ui-avatars.com service
  - `getLogoUrl(logo, tenantName, urlFor)`: Helper to get logo URL with fallback
  - Uses tenant name initials and brand colors for default logos

### 3. Component Updates
- **components/ImageOptimized.jsx**: Updated `CompanyLogo` component
  - Now always renders a logo (custom or default)
  - Removed null return when no logo exists
  - Uses default logo URL when tenant has no custom logo

- **components/directory/_components/DirectoryTenantCard.jsx**: 
  - Simplified logo rendering
  - Removed placeholder div fallback
  - Uses default logo utility

- **app/(public)/become/_components/StepBasicInfo.jsx**:
  - Changed logo label from required (*) to optional
  - Added helper text explaining default logo will be used
  - Removed logo requirement from form validation

### 4. Validation Updates
- **components/business/validation/shared.js**: 
  - Removed logo requirement from `logoValidation` function
  - Logo is now completely optional in forms

## Default Logo Service
Using ui-avatars.com API which generates:
- SVG format for crisp display at any size
- Tenant name initials as logo text
- Brand colors (blue background, white text)
- 200x200px default size

Example: `https://ui-avatars.com/api/?name=Company+Name&size=200&background=3b82f6&color=ffffff&bold=true&format=svg`

## Alternative Options
To use a local default image instead:
1. Add image to `public/images/default-logo.png`
2. Update `lib/utils/defaultLogo.js` line 11 to return local path
3. Comment out ui-avatars.com line

## Testing Checklist
- [ ] Create new tenant without logo - should show default
- [ ] Create new tenant with logo - should show custom logo
- [ ] View existing tenants without logos - should show default
- [ ] View existing tenants with logos - should show custom logos
- [ ] Check directory listing page
- [ ] Check tenant detail page
- [ ] Check business dashboard
- [ ] Verify default logos are SEO-friendly with proper alt text
