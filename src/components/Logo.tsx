/**
 * The MRBC logo mark. The image is only used as a shape, so the logo takes the
 * text color around it and works on light, dark, and navy backgrounds.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block aspect-[359/512] shrink-0 bg-current [mask:url(/mrbc-mark.png)_center/contain_no-repeat] ${className}`}
    />
  );
}
