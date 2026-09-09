import { PixelBrand } from "@/components/brand/pixel-brand";

export function AppLoadingScreen() {
  return (
    <div
      className="app-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Lapa tiek ielādēta"
    >
      <PixelBrand variant="intro" />
      <span className="sr-only">Lapa tiek ielādēta...</span>
    </div>
  );
}
