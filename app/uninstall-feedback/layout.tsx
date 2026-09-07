import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback — GoFully",
  description: "Tell us why you uninstalled GoFully so we can improve it.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://gofully-extension.vercel.app/uninstall-feedback" },
};

export default function UninstallFeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
