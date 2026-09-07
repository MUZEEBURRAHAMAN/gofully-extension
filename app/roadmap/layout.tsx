import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Public Roadmap — GoFully",
  description: "Explore upcoming features, milestones, and release plans for the GoFully Chrome screenshot and annotation extension.",
  alternates: { canonical: "https://gofully-extension.vercel.app/roadmap" },
  openGraph: {
    title: "Public Roadmap — GoFully",
    description: "Upcoming features and releases for GoFully.",
    url: "https://gofully-extension.vercel.app/roadmap",
    siteName: "GoFully",
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd name="Roadmap" path="/roadmap" />
      {children}
    </>
  );
}
