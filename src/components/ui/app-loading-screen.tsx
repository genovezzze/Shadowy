import Image from "next/image";

export function AppLoadingScreen() {
  return (
    <div
      className="app-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Lapa tiek ielādēta"
    >
      <div className="app-loading-brand" aria-hidden="true">
        <span className="app-loading-logo">
          <Image src="/shadowy.svg" alt="" width={64} height={64} priority />
        </span>
        <span className="app-loading-wordmark">Shadowy</span>
      </div>
      <span className="sr-only">Lapa tiek ielādēta...</span>
    </div>
  );
}
