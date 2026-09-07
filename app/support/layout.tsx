import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Support & Help Center — GoFully",
  description: "Get assistance, report issues, or suggest features for the GoFully Chrome screenshot extension.",
  alternates: { canonical: "https://gofully-extension.vercel.app/support" },
  openGraph: {
    title: "Support & Help Center — GoFully",
    description: "Get support for GoFully screenshot extension.",
    url: "https://gofully-extension.vercel.app/support",
    siteName: "GoFully",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd name="Support" path="/support" />
      {children}
    </>
  );
}
