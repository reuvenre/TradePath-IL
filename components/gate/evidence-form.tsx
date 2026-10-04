"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitGateEvidence } from "@/lib/learner/actions";
import { createClient } from "@/lib/supabase/client";
import { he } from "@/lib/strings/he";

interface Props {
  stage: number;
  requirement: string;
  description: string;
  userId: string | null;
  passedAt: string | null;
  persist: boolean;
}

const BUCKET = "journal";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Practical-task evidence: a written description plus an optional screenshot. The file goes to the
 * learner's own folder in the `journal` bucket (storage policy: first folder = auth.uid()).
 */
export function EvidenceForm({ stage, requirement, description, userId, passedAt, persist }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(passedAt);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <p className="mt-3 flex items-center gap-2 font-medium" role="status">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        {he.gate.evidenceSaved("")}
        <bdi dir="ltr">{done.slice(0, 10)}</bdi>
      </p>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (text.trim().length < 20) return setError(he.gate.evidenceTooShort);
    if (!persist) return setDone(new Date().toISOString());
    start(async () => {
      const files: string[] = [];
      if (file && userId) {
        if (file.size > MAX_BYTES) return setError(he.gate.evidenceFileHelp);
        const safe = file.name.replace(/[^\w.-]+/g, "_").slice(-60);
        const path = `${userId}/gates/s${stage}/${Date.now()}-${safe}`;
        const { error: upErr } = await createClient().storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) return setError(he.gate.uploadFailed);
        files.push(path);
      }
      const r = await submitGateEvidence({ stage, requirement, text, files });
      if (r.ok) setDone(new Date().toISOString());
      else setError(r.error);
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4" data-testid="evidence">
      <p className="leading-relaxed">{description}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`evidence-text-${requirement}`}>{he.gate.evidenceText}</Label>
        <Textarea
          id={`evidence-text-${requirement}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={he.gate.evidenceTextPlaceholder}
          aria-invalid={text !== "" && text.trim().length < 20}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`evidence-file-${requirement}`}>{he.gate.evidenceFile}</Label>
        <Input
          id={`evidence-file-${requirement}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="h-11 pt-2"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          aria-describedby={`evidence-file-help-${requirement}`}
        />
        <p id={`evidence-file-help-${requirement}`} className="text-xs text-muted-foreground">
          {he.gate.evidenceFileHelp}
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="min-h-11 self-start" disabled={pending}>
        {pending ? he.common.saving : he.gate.evidenceSubmit}
      </Button>
    </form>
  );
}
