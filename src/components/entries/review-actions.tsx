"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewEntry } from "@/app/manager/entries/actions";

interface ReviewActionsProps {
  entryId: string;
}

export function ReviewActions({ entryId }: ReviewActionsProps) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "reject" | "return">("idle");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(action: "APPROVE" | "REJECT" | "RETURN") {
    setError(null);
    startTransition(async () => {
      const res = await reviewEntry({ entryId, action, comment });
      if (!res.ok) {
        setError(res.error);
      } else {
        setMode("idle");
        setComment("");
      }
    });
  }

  if (mode === "idle") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMode("return")}
          disabled={pending}
        >
          Nosūtīt atpakaļ ar komentāru
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setMode("reject")}
          disabled={pending}
        >
          Noraidīt
        </Button>
        {error ? (
          <span className="text-xs text-destructive ml-2">{error}</span>
        ) : null}
      </div>
    );
  }

  const isReturn = mode === "return";

  return (
    <div className="space-y-2">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={
          isReturn
            ? "Pastāstiet darbiniekam, ko būtu vērts papildināt vai precizēt."
            : "Pamatojiet, kāpēc ieraksts tiek noraidīts."
        }
        minLength={3}
      />
      {error ? (
        <div className="text-xs text-destructive">{error}</div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isReturn ? "default" : "destructive"}
          disabled={pending || comment.trim().length < 3}
          onClick={() => act(isReturn ? "RETURN" : "REJECT")}
        >
          {pending
            ? "Saglabā..."
            : isReturn
            ? "Nosūtīt atpakaļ"
            : "Apstiprināt noraidījumu"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setMode("idle");
            setComment("");
            setError(null);
          }}
          disabled={pending}
        >
          Atcelt
        </Button>
      </div>
    </div>
  );
}
