"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MapPin, Server } from "lucide-react";
import { useMediaQuery } from "@/lib/device";
import { relayPath, type RelayLink, type RelayServer } from "@/lib/derive";
import type { InvestigateResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Empty, Panel, Section } from "./section";

type ServerNode = Node<{ server: RelayServer; index: number }, "server">;

const ROLE_LABEL = { origin: "Origin", relay: "Relay", recipient: "Recipient server" };

function ServerCard({ data }: NodeProps<ServerNode>) {
  const { server, index } = data;
  const g = server.geo;
  return (
    <div
      className={cn(
        "w-[240px] rounded-xl border bg-panel p-3.5 shadow-[0_1px_2px_rgb(5_6_9/0.06),0_8px_24px_-12px_rgb(5_6_9/0.18)]",
        server.role === "origin" ? "border-gold" : server.role === "recipient" ? "border-sapphire" : "border-line"
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-line-strong" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          {index + 1}. {ROLE_LABEL[server.role]}
        </span>
        <Server className="size-3.5 text-subtle" />
      </div>
      <p className="mt-1.5 truncate font-mono text-[12.5px] font-medium" title={server.host}>
        {server.host}
      </p>
      <p className="font-mono text-[12px] text-muted">{server.ip ?? "IP not recorded"}</p>
      {g && (
        <div className="mt-2 border-t border-line pt-2 text-[12px]">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3 text-high-fg" />
            {[g.city, g.region, g.country_name ?? g.country].filter(Boolean).join(", ") || "Location unknown"}
          </p>
          {g.org && <p className="mt-0.5 truncate text-muted" title={g.org}>{g.org}</p>}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-line-strong" />
    </div>
  );
}

const nodeTypes = { server: ServerCard };

function linkLabel(l: RelayLink) {
  if (l.gap) return "not recorded";
  const bits = [l.protocol, l.delaySec !== null ? `+${l.delaySec}s` : null].filter(Boolean);
  return bits.join(" · ");
}

// Takes servers/links so richer backend geolocation can be passed in later.
export function RelayGraph({ servers, links }: { servers: RelayServer[]; links: RelayLink[] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: ServerNode[] = servers.map((s, i) => ({
      id: String(i),
      type: "server",
      position: { x: i * 300, y: i % 2 ? 40 : 0 },
      data: { server: s, index: i },
      draggable: true,
    }));
    const edges: Edge[] = links.map((l, i) => ({
      id: `e${i}`,
      source: String(i),
      target: String(i + 1),
      animated: !l.gap,
      label: linkLabel(l) || undefined,
      labelStyle: { fontSize: 11, fontFamily: "var(--font-jetbrains-mono)", fill: l.gap ? "#8D919B" : undefined },
      labelBgStyle: { fill: "#FCF7F8" },
      style: l.gap ? { stroke: "#B9B2AF", strokeWidth: 1.5, strokeDasharray: "4 4" } : { stroke: "#2667FF", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: l.gap ? "#B9B2AF" : "#2667FF" },
    }));
    return { nodes, edges };
  }, [servers, links]);

  return (
    <div className="h-[340px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        zoomOnScroll={false}
      >
        <Background gap={16} size={1} color="#E3DDDA" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

// Phones: the same path as a vertical timeline. A pannable graph fights the
// page scroll on touch and its cards don't fit a narrow screen.
function RelayTimeline({ servers, links }: { servers: RelayServer[]; links: RelayLink[] }) {
  return (
    <ol className="px-4 py-4">
      {servers.map((s, i) => {
        const g = s.geo;
        const link = links[i];
        const place = g ? [g.city, g.region, g.country_name ?? g.country].filter(Boolean).join(", ") : "";
        return (
          <li key={i} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full border-2 bg-panel font-mono text-[11px] font-semibold",
                s.role === "origin" ? "border-gold" : s.role === "recipient" ? "border-sapphire" : "border-line-strong"
              )}
            >
              {i + 1}
            </span>
            {link && (
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-0 left-[13px] top-8 w-0.5",
                  link.gap ? "bg-[repeating-linear-gradient(to_bottom,#B9B2AF_0_4px,transparent_4px_8px)]" : "bg-sapphire/60"
                )}
              />
            )}
            <div className={cn("min-w-0", link ? "pb-2" : "")}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">{ROLE_LABEL[s.role]}</p>
              <p className="mt-0.5 break-all font-mono text-[12.5px] font-medium">{s.host}</p>
              <p className="font-mono text-[12px] text-muted">{s.ip ?? "IP not recorded"}</p>
              {g && (
                <p className="mt-1 flex items-start gap-1.5 text-[12px]">
                  <MapPin className="mt-0.5 size-3 shrink-0 text-high-fg" />
                  <span className="min-w-0">
                    {place || "Location unknown"}
                    {g.org && <span className="text-muted"> · {g.org}</span>}
                  </span>
                </p>
              )}
              {link && (
                <p className={cn("my-3 font-mono text-[11.5px]", link.gap ? "text-subtle" : "text-brand-fg")}>
                  ↓ {linkLabel(link) || "next hop"}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RelaySection({ r }: { r: InvestigateResponse }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const { servers, links } = relayPath(r);
  const located = servers.filter((s) => s.geo).length;
  const hops = links.filter((l) => !l.gap).length;

  return (
    <Section
      id="relay"
      title="Relay path"
      description="The mail servers this email passed through, oldest first, reconstructed from Received headers."
    >
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-4 py-4 sm:px-5">
          <h3 className="text-[15px] font-semibold">
            {servers.length} server{servers.length === 1 ? "" : "s"} · {hops} hop{hops === 1 ? "" : "s"}
          </h3>
          <span className="text-[12.5px] text-muted">
            {located ? `${located} located via IPinfo` : "No IP geolocation for these hops"}
            {wide && " · drag to rearrange"}
          </span>
        </div>
        <div className="border-t border-line">
          {servers.length === 0 ? (
            <Empty>No Received headers found in this email.</Empty>
          ) : wide ? (
            <RelayGraph servers={servers} links={links} />
          ) : (
            <RelayTimeline servers={servers} links={links} />
          )}
        </div>
        <p className="border-t border-line px-4 py-3 text-[12px] text-muted sm:px-5">
          Hosting location describes infrastructure, not the person who sent the email. Headers before the first trusted server can be forged.
        </p>
      </Panel>
    </Section>
  );
}
