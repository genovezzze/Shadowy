export function startNavigationLoading(destination?: string) {
  if (typeof window === "undefined") return;
  if (destination) {
    const nextUrl = new URL(destination, window.location.href);
    const currentRoute = `${window.location.pathname}${window.location.search}`;
    const nextRoute = `${nextUrl.pathname}${nextUrl.search}`;
    if (currentRoute === nextRoute) return;
  }
  window.dispatchEvent(new Event("shadowy:navigation-start"));
}
