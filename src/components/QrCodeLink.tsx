/** A QR code that is also a link: tap or click it to open the page it points to. */
export function QrCodeLink({ url, svg, className }: { url: string; svg: string; className: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${url}`}
      aria-label={`QR code. Open ${url}`}
      className={`block cursor-pointer transition hover:opacity-80 ${className}`}
      style={{ colorScheme: "light", background: "#fff" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
