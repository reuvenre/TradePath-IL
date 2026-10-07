/** Static diagram with a mandatory Hebrew alt. Images under /public; sizes vary, so a plain <img>. */
export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- content images have unknown dimensions */}
      <img src={src} alt={alt} className="mx-auto max-h-96 rounded-lg border" loading="lazy" />
      {caption ? <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}
