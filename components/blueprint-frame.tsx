/**
 * Corner registration marks + hairline border for the "Industry" blueprint
 * design system — every card, image and primary CTA on the redesigned
 * landing page wears this frame instead of a soft rounded/shadowed surface.
 */
function Corners({ color = "rgba(29,31,32,.25)" }: { color?: string }) {
  const marks: Array<{ cls: string }> = [
    { cls: "-top-1 -left-1" },
    { cls: "-top-1 -right-1" },
    { cls: "-bottom-1 -left-1" },
    { cls: "-bottom-1 -right-1" },
  ];
  return (
    <>
      {marks.map((m, i) => (
        <span key={i} className={`absolute ${m.cls} w-2 h-2 pointer-events-none`}>
          <span
            className="absolute left-[3px] top-0 w-px h-full"
            style={{ background: color }}
          />
          <span
            className="absolute top-[3px] left-0 w-full h-px"
            style={{ background: color }}
          />
        </span>
      ))}
    </>
  );
}

export function BlueprintFrame({
  children,
  className = "",
  markColor,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  markColor?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`relative border border-[rgba(29,31,32,.12)] ${className}`} style={style}>
      <Corners color={markColor} />
      {children}
    </div>
  );
}
