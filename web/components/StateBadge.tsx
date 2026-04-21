import type { ResponseState } from "@/types/crisis";

const styles: Record<ResponseState, string> = {
  needs_identified: "border border-needsIdentified/35 bg-needsIdentified/10 text-[#85b6d5]",
  ping_sent: "border border-pingSent/35 bg-pingSent/10 text-[#e2c26a]",
  response_confirmed:
    "border border-responseConfirmed/35 bg-responseConfirmed/10 text-[#74c69a]",
  gap_flagged: "border border-gapFlagged/35 bg-gapFlagged/10 text-[#e19298]",
};

export function StateBadge({ state }: { state: ResponseState }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[state]}`}
    >
      {state.replaceAll("_", " ")}
    </span>
  );
}
