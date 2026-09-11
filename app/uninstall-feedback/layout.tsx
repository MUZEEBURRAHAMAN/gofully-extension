import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uninstall Feedback",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UninstallFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
