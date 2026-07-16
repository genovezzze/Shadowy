import type { Metadata } from "next";
import { MobileShell } from "@/components/layout/mobile-shell";
import { SmartWorkLog } from "@/components/entries/smart-work-log";

export const metadata: Metadata = {
  title: "Mobile preview",
  robots: { index: false, follow: false },
};

export default function MobileDemoPage() {
  return (
    <div className="dark">
      {/* Decorative iframe preview - hide scrollbars so it reads as a real
          device screenshot instead of a scrollable web page. */}
      <style>{`
        html, body { overflow: hidden !important; scrollbar-width: none; overscroll-behavior: none; }
        .app-shell main {
          overflow: hidden !important;
          overscroll-behavior: none;
          touch-action: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>
      <MobileShell
        role="EMPLOYEE"
        userName="Ilze Darbiniece"
        organizationName="Demo Uzņēmums SIA"
        unreadNotificationCount={2}
      >
        <SmartWorkLog clients={[]} />
      </MobileShell>
    </div>
  );
}
