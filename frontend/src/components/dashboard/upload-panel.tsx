"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, FileUp, Loader2, X } from "lucide-react";
import BorderGlow from "@/components/reactbits/BorderGlow";
import FolderFloat from "@/components/reactbits/FolderFloat";
import { GlowCursor } from "@/components/reactbits/glow-cursor";
import { Grainient } from "@/components/reactbits/grainient";
import { ApiError, investigate, MAX_EML_BYTES } from "@/lib/api";
import { formatBytes } from "@/lib/derive";
import { saveInvestigation } from "@/lib/history";
import { cn } from "@/lib/utils";

const STEPS = [
  "Parsing MIME structure",
  "Reading sender headers",
  "Checking SPF, DKIM, DMARC",
  "Tracing relay path",
  "Checking links with VirusTotal",
  "AI content analysis",
];

const SAMPLES = [
  { label: "Account suspension", value: "suspicious_test.eml" },
  { label: "CEO fraud (BEC)", value: "ceo_fraud.eml" },
  { label: "Parcel + attachment", value: "malicious_attachment.eml" },
  { label: "Clean newsletter", value: "clean_newsletter.eml" },
];

type State =
  | { kind: "idle" }
  | { kind: "ready"; file: File }
  | { kind: "running"; file: File; step: number }
  | { kind: "error"; file: File | null; message: string };

function validate(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".eml")) return `“${file.name}” isn’t an .eml file.`;
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_EML_BYTES) return "File is larger than 10 MB.";
  return null;
}

export function UploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const running = state.kind === "running";

  // Advance the visible steps while the request is in flight; hold on the last one.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setState((s) => (s.kind === "running" && s.step < STEPS.length - 1 ? { ...s, step: s.step + 1 } : s));
    }, 900);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function select(file: File | undefined) {
    if (!file) return;
    const problem = validate(file);
    setState(problem ? { kind: "error", file: null, message: problem } : { kind: "ready", file });
  }

  async function analyze(file: File) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState({ kind: "running", file, step: 0 });
    try {
      const result = await investigate(file, ctrl.signal);
      setState({ kind: "running", file, step: STEPS.length });
      const saved = saveInvestigation(result, file.size);
      router.push(`/investigate/${saved.id}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({
        kind: "error",
        file,
        message: err instanceof ApiError ? err.message : "Something went wrong while analysing this email.",
      });
    }
  }

  async function runSample(name: string) {
    if (running) return;
    try {
      const res = await fetch(`/samples/${name}`);
      const blob = await res.blob();
      analyze(new File([blob], name, { type: "message/rfc822" }));
    } catch {
      setState({ kind: "error", file: null, message: "Couldn't load that sample." });
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!running) select(e.dataTransfer.files[0]);
  }

  const file = state.kind === "idle" ? null : state.file;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-black text-snow [clip-path:inset(0_round_1.5rem)]">
      <div aria-hidden className="absolute inset-0 opacity-90">
        <Grainient
          color1="#050609"
          color2="#3a2708"
          color3="#D5A021"
          timeSpeed={0.12}
          warpStrength={0.8}
          warpAmplitude={40}
          grainAmount={0.08}
          contrast={1.2}
          saturation={0.9}
          zoom={1.1}
          centerX={0.7}
        />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

      <GlowCursor
        className="relative z-10 !h-auto"
        color="#D5A021"
        secondaryColor="#F2C14E"
        trailWidth={7}
        glowIntensity={1.5}
        opacity={0.7}
      >
        <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:p-10">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-snow/60">New investigation</p>
            <h1 className="mt-1 text-[32px] font-semibold leading-tight tracking-[-0.035em] sm:text-[40px]">
              Investigate an email
            </h1>
            <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-snow/70">
              Drop the raw <span className="font-mono text-snow">.eml</span> file. Headers, authentication,
              relay path, links and attachments are pulled apart and scored.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!running) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "mt-8 rounded-2xl border border-dashed p-5 backdrop-blur-md transition-colors sm:p-6",
                dragging ? "border-gold bg-gold/10" : "border-snow/20 bg-snow/[0.06]"
              )}
            >
              {state.kind === "running" ? (
                <Progress name={state.file.name} step={state.step} />
              ) : (
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-snow/10">
                    {file ? <FileText className="size-5" /> : <FileUp className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {file ? (
                      <>
                        <p className="truncate font-mono text-[14px]">{file.name}</p>
                        <p className="mt-0.5 text-[13px] text-snow/60">
                          {formatBytes(file.size)} ·{" "}
                          <button className="underline-offset-2 hover:underline" onClick={() => inputRef.current?.click()}>
                            choose another
                          </button>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[15px] font-medium">
                          {dragging ? "Release to add this file" : "Drag and drop an .eml file"}
                        </p>
                        <p className="mt-0.5 text-[13px] text-snow/60">Up to 10 MB, analysed only for this investigation</p>
                      </>
                    )}
                  </div>
                  <BorderGlow
                    backgroundColor={file ? "#D5A021" : "#FCF7F8"}
                    borderRadius={12}
                    glowRadius={18}
                    edgeSensitivity={20}
                    glowColor="42 70 60"
                    colors={["#D5A021", "#2667FF", "#F2C14E"]}
                  >
                    <button
                      type="button"
                      onClick={() => (file ? analyze(file) : inputRef.current?.click())}
                      className="h-11 px-6 text-[14px] font-semibold text-black active:scale-[0.98]"
                    >
                      {file ? (state.kind === "error" ? "Try again" : "Analyze") : "Browse files"}
                    </button>
                  </BorderGlow>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".eml,message/rfc822"
                    className="hidden"
                    onChange={(e) => {
                      select(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>

            {state.kind === "error" && (
              <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-ruby/60 bg-ruby/25 px-3 py-2.5 text-[13.5px] text-snow">
                <X className="mt-0.5 size-4 shrink-0" />
                <span>{state.message}</span>
                <button className="ml-auto shrink-0 text-snow/70 hover:text-snow" onClick={() => setState({ kind: "idle" })}>
                  Dismiss
                </button>
              </div>
            )}
          </div>

          <div className="flex items-end justify-center pt-40 lg:pt-0">
            <FolderFloat
              items={SAMPLES}
              label="Sample emails"
              sublabel="Hover, then pick one"
              trigger="hover"
              physics
              drift={0.4}
              spread={170}
              width={210}
              height={140}
              radius={14}
              folderColor="#2a1f0a"
              frontColor="#D5A021"
              paperColor="#FCF7F8"
              itemColor="#FCF7F8"
              itemTextColor="#050609"
              labelColor="#050609"
              onSelect={(value) => runSample(value)}
            />
          </div>
        </div>
      </GlowCursor>
    </section>
  );
}

function Progress({ name, step }: { name: string; step: number }) {
  const pct = Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100);
  return (
    <div aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <p className="truncate font-mono text-[13px]">{name}</p>
        <p className="font-mono text-[13px] text-gold">{pct}%</p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-snow/10">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${Math.max(pct, 6)}%` }} />
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s} className={cn("flex items-center gap-2.5 text-[13px]", done ? "text-snow" : active ? "text-snow/85" : "text-snow/35")}>
              {done ? (
                <Check className="size-3.5 text-[#3fcf8e]" />
              ) : active ? (
                <Loader2 className="size-3.5 animate-spin text-gold" />
              ) : (
                <span className="size-3.5 rounded-full border border-snow/20" />
              )}
              {s}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
