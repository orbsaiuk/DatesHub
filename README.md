# DatesHub Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Database/CMS**: Sanity
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Next.js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/business
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/become

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# Other services (if applicable)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deployment Checklist

### 1. Environment Variables Setup

When deploying to production, ensure all environment variables are properly configured:

#### **Clerk Authentication**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your production Clerk publishable key
- `CLERK_SECRET_KEY` - Your production Clerk secret key
- Update sign-in/sign-up URLs to production domain
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Post-login redirect
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Post-signup redirect

#### **Sanity CMS**

- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Use `production` for live deployment
- `SANITY_API_TOKEN` - API token with write permissions

#### **Site Configuration**

- `NEXT_PUBLIC_SITE_URL` - Your production domain (e.g., `https://yourdomain.com`)

### 2. Webhook URLs Update

Update webhook endpoints to point to your production domain:

#### **Clerk Webhooks**

In your Clerk Dashboard → Webhooks, update endpoint URLs:

- User created: `https://yourdomain.com/api/webhooks/clerk/user-created`
- User updated: `https://yourdomain.com/api/webhooks/clerk/user-updated`
- User deleted: `https://yourdomain.com/api/webhooks/clerk/user-deleted`

#### **Other Webhooks** (if configured)

- Payment webhooks (Stripe, etc.)
- Email service webhooks
- Any third-party integration webhooks

### 3. Domain Configuration

#### **Clerk Domain Settings**

- Add your production domain to Clerk's allowed origins
- Configure production redirect URLs
- Update CORS settings if needed

#### **Sanity CORS Settings**

- Add your production domain to Sanity's CORS origins
- Configure API access for production

### 4. Build Configuration

#### **Next.js Build Settings**

```bash
# Build command
pnpm build

# Start command
pnpm start
```

#### **Environment-specific Settings**

- Ensure `NODE_ENV=production` is set
- Configure any analytics or monitoring tools
- Set up error tracking (Sentry, etc.)

### 5. Database/Content Migration

#### **Sanity Content**

- Deploy Sanity Studio to production
- Migrate content from development to production dataset if needed
- Configure production API tokens

### 6. Post-Deployment Verification

- [ ] Authentication flow works correctly
- [ ] User registration and login functional
- [ ] Webhooks receiving data properly
- [ ] Database connections established
- [ ] All API routes responding correctly
- [ ] File uploads working (if applicable)
- [ ] Email notifications sending (if configured)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (public)/          # Public pages
│   ├── api/               # API routes
│   ├── business/          # Business dashboard
│   └── studio/            # Sanity Studio
├── components/            # React components
│   ├── business/          # Business-specific components
│   ├── sections/          # Page sections
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
├── sanity/                # Sanity configuration
│   ├── queries/           # GROQ queries
│   ├── schemaTypes/       # Content schemas
│   └── lib/               # Sanity clients
└── services/              # External service integrations
```

## Key Features

- **Authentication**: Clerk-based user management
- **Multi-tenant**: Company and Supplier dashboards
- **Content Management**: Sanity CMS integration
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Optimistic UI updates
- **File Uploads**: Image handling with Sanity
- **Advanced Filtering**: Search and filter functionality

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Data**
   - Verify webhook URL is correct and accessible
   - Check webhook secret/signing key
   - Ensure proper HTTP method (POST)

2. **Authentication Errors**
   - Verify Clerk environment variables
   - Check domain configuration in Clerk dashboard
   - Ensure redirect URLs are correctly configured

3. **Sanity Connection Issues**
   - Verify project ID and dataset name
   - Check API token permissions
   - Ensure CORS settings include your domain
