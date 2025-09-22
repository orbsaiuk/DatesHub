import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import StructuredData, {
  generateWebsiteSchema,
} from "@/components/StructuredData";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { arSA } from "@clerk/localizations";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OrbsAI",
    template: "%s | OrbsAI",
  },
  description:
    "اكتشف وتواصل مع الشركات والموردين المعتمدين حول العالم. استكشف فئات الأعمال والعروض الحصرية وملفات الشركات التفصيلية. انضم إلى شبكتنا الموثوقة اليوم.",
  keywords: [
    "business directory",
    "companies",
    "suppliers",
    "B2B marketplace",
    "verified businesses",
    "business networking",
    "company profiles",
    "supplier directory",
    "business offers",
    "corporate partnerships",
  ],
  authors: [{ name: "OrbsAI Team" }],
  creator: "OrbsAI",
  publisher: "OrbsAI",
  applicationName: "OrbsAI",
  category: "Business",
  classification: "Business Directory",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "OrbsAI",
    title: "OrbsAI",
    description:
      "اكتشف وتواصل مع الشركات والموردين المعتمدين. استكشف الفئات والعروض وتفاصيل الأعمال.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OrbsAI - Business Directory Platform",
        type: "image/jpeg",
      },
    ],
    locale: "ar",
  },
  twitter: {
    card: "summary_large_image",
    site: "@orbsai",
    creator: "@orbsai",
    title: "OrbsAI - تواصل مع شركات وموردين موثوقين",
    description:
      "اكتشف وتواصل مع الشركات والموردين حول العالم. استكشف فئات الأعمال والعروض الحصرية وملفات الشركات التفصيلية.",
    images: [
      {
        url: "/og-image.jpg",
        alt: "OrbsAI - Business Directory Platform",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0ea5e9" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
};

export const customArabic = {
  ...arSA,
  formFieldInputPlaceholder__backupCode: "أدخل رمز النسخ الاحتياطي",
  formFieldInputPlaceholder__confirmDeletionUserAccount:
    "اكتب حذف الحساب لتأكيد العملية",
  formFieldInputPlaceholder__emailAddress: "أدخل بريدك الإلكتروني",
  formFieldInputPlaceholder__emailAddress_username:
    "أدخل بريدك الإلكتروني أو اسم المستخدم",
  formFieldInputPlaceholder__emailAddresses:
    "أدخل أو لصق عنوان بريد إلكتروني واحد أو أكثر ، مفصولة بمسافات أو فواصل",
  formFieldInputPlaceholder__firstName: "أدخل الاسم الأول",
  formFieldInputPlaceholder__lastName: "أدخل اسم العائلة",
  formFieldInputPlaceholder__organizationDomain: "أدخل نطاق المؤسسة",
  formFieldInputPlaceholder__organizationDomainEmailAddress:
    "أدخل بريد المؤسسة الإلكتروني",
  formFieldInputPlaceholder__organizationName: "أدخل اسم المؤسسة",
  formFieldInputPlaceholder__organizationSlug: "أدخل المعرف (slug) للمؤسسة",
  formFieldInputPlaceholder__password: "أدخل كلمة المرور",
  formFieldInputPlaceholder__phoneNumber: "أدخل رقم الهاتف",
  formFieldInputPlaceholder__username: "أدخل اسم المستخدم",
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  };
}

export default function RootLayout({ children }) {
  const websiteSchema = generateWebsiteSchema();

  return (
    <ClerkProvider
      appearance={{
        layout: { unsafe_disableAnimations: false },
        variables: { colorPrimary: "#0ea5e9" },
      }}
      localization={customArabic}
    >
      <html lang="ar" dir="rtl">
        <head>
          <StructuredData data={websiteSchema} />
          <meta
            name="description"
            content="اكتشف وتواصل مع الشركات والموردين حول العالم. تصفح الفئات والعروض وملفات الشركات التفصيلية. انضم إلى شبكتنا الموثوقة للأعمال اليوم."
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="preconnect" href="https://cdn.sanity.io" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <BreadcrumbProvider>{children}</BreadcrumbProvider>
          <SanityLive />
          <div id="clerk-captcha" data-cl-size="flexible" />
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
