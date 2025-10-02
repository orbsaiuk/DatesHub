# Design Document

## Overview

This design outlines the systematic removal of the category system from the blog functionality. The current implementation has blogs with a required category field that references a separate category document type. This change will eliminate category dependencies, simplify the blog data structure, and remove category-related UI components and queries while maintaining all existing blog functionality.

## Architecture

### Current Architecture
- **Blog Schema**: Contains a required `category` field that references the `category` document type
- **Category Schema**: Standalone document type with title, slug, icon, and description
- **Blog Queries**: Include category projections in GROQ queries for blog cards and details
- **Blog Components**: Display category badges and use categories for related blog logic
- **Blog API**: Accepts and validates category references during blog creation/updates

### Target Architecture
- **Blog Schema**: Category field completely removed, no category references
- **Category Schema**: Remains intact but unused by blogs (may be used by other features)
- **Blog Queries**: Category projections removed from all blog-related queries
- **Blog Components**: Category displays removed, alternative logic for related blogs
- **Blog API**: Category handling removed from creation/update endpoints

## Components and Interfaces

### 1. Schema Changes

#### Blog Schema (`sanity/schemaTypes/blog.js`)
- **Remove**: `category` field definition and validation
- **Maintain**: All other fields (title, slug, excerpt, content, author, status, etc.)
- **Impact**: Existing blog documents will retain category data but it won't be accessible through the schema

#### Schema Index (`sanity/schemaTypes/index.js`)
- **Maintain**: Category schema export (may be used by other features)
- **No Changes**: Keep category in schema types array

### 2. Query Updates

#### Blog Queries (`sanity/queries/blogs.js`)
- **Update**: `BLOG_CARD_PROJECTION` - remove category projection
- **Update**: `BLOG_DETAIL_PROJECTION` - remove category projection  
- **Update**: `RELATED_BLOGS_QUERY` - change logic from category-based to alternative criteria
- **Update**: `buildBlogsQuery` function - remove categoryId parameter and filtering
- **Maintain**: All other query functionality

#### Related Blog Logic
- **Current**: Uses `category._ref == $categoryId` for finding related blogs
- **New**: Use author-based or recent blogs as fallback for related content
- **Fallback**: When no specific criteria available, return recent published blogs

### 3. Component Updates

#### BlogCard Component (`components/blog/BlogCard.jsx`)
- **Remove**: Category badge display section
- **Remove**: Category-related styling and layout
- **Maintain**: All other blog card functionality (image, title, excerpt, author, etc.)

#### Blog Form Components
- **Remove**: Category selection fields from blog creation/editing forms
- **Remove**: Category validation in form submission
- **Update**: Form layouts to accommodate removed category fields

#### Blog Search/Filter Components
- **Remove**: Category-based filtering options
- **Maintain**: Other filtering capabilities (author, status, search text)

### 4. API Endpoint Changes

#### Blog Creation API (`app/api/blogs/create/route.js`)
- **Remove**: Category parameter from request body destructuring
- **Remove**: Category reference assignment in blog document creation
- **Remove**: Category validation logic
- **Maintain**: All other blog creation functionality

#### Blog Update APIs
- **Remove**: Category handling from update operations
- **Maintain**: All other update functionality

### 5. Service Layer Updates

#### Blog Services (`services/sanity/blogs.js`)
- **Update**: `getRelatedBlogs` function to use alternative logic
- **Remove**: Category-based query building in `getBlogsByQuery`
- **Maintain**: All other service functions

## Data Models

### Updated Blog Document Structure
```javascript
{
  _type: "blog",
  title: "string",
  slug: { _type: "slug", current: "string" },
  excerpt: "text",
  contentHtml: "text",
  contentText: "text", 
  blogImage: "image",
  // category: REMOVED
  author: {
    authorType: "company" | "supplier",
    company?: "reference",
    supplier?: "reference"
  },
  status: "pending" | "published" | "rejected",
  views: "number",
  featured: "boolean",
  createdAt: "datetime"
}
```

### Related Blog Algorithm
Since category-based related blogs will be removed, implement this fallback logic:
1. **Primary**: Find blogs by the same author (company/supplier)
2. **Secondary**: Find recent published blogs if no same-author blogs exist
3. **Limit**: Return maximum 5 related blogs

## Error Handling

### Schema Migration
- **Graceful Degradation**: Existing blogs with category references will continue to work
- **Query Safety**: Queries will not fail if category data exists but is not projected
- **Validation**: Remove category validation to prevent creation failures

### Component Resilience
- **Null Safety**: Components should handle missing category data gracefully
- **Layout Stability**: Removing category badges should not break component layouts
- **Fallback Content**: Related blogs should always return some content

### API Compatibility
- **Backward Compatibility**: API should accept but ignore category parameters during transition
- **Error Prevention**: Remove category validation that could cause creation failures

## Testing Strategy

### Unit Testing
- **Schema Validation**: Test blog creation without category requirements
- **Query Testing**: Verify queries work without category projections
- **Component Testing**: Test blog components render correctly without category data

### Integration Testing
- **API Testing**: Test blog creation/update APIs without category data
- **End-to-End**: Test complete blog workflows without category dependencies
- **Data Migration**: Test that existing blogs continue to work

### Manual Testing
- **UI Verification**: Confirm category elements are removed from all interfaces
- **Workflow Testing**: Test blog creation, editing, and viewing workflows
- **Related Content**: Verify related blog logic works with new algorithm

## Migration Considerations

### Data Preservation
- **No Data Loss**: Existing blog category data remains in database but becomes inaccessible
- **Rollback Capability**: Changes can be reverted by restoring category field to schema
- **Clean Migration**: No database scripts needed, purely schema and code changes

### Deployment Strategy
- **Single Deployment**: All changes can be deployed together
- **No Downtime**: Changes are additive (removing unused functionality)
- **Immediate Effect**: Category removal takes effect immediately after deployment

### Monitoring
- **Error Tracking**: Monitor for any category-related errors after deployment
- **Performance**: Verify related blog queries perform adequately with new logic
- **User Experience**: Confirm blog workflows remain smooth without categories