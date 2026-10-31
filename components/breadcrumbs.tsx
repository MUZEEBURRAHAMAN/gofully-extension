import Link from "next/link";
import { serializeJsonLd } from "@/components/json-ld";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const siteUrl = "https://gofully-extension.vercel.app";

  const allItems = [
    { label: "Home", href: "/" },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`gf-bc ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 list-none m-0 p-0">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="gf-bc-sep" aria-hidden="true">/</span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="gf-bc-link"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="gf-bc-current"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
