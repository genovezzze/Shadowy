"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function href(target: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(target));
    return `${pathname}?${next.toString()}`;
  }

  return (
    <nav className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(page - 1)}>
            <ChevronLeft className="h-4 w-4" /> Iepriekšējā
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" /> Iepriekšējā
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Lapa {page} no {totalPages}
      </span>

      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(page + 1)}>
            Nākamā <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Nākamā <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
