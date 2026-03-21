"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/status-chip";
import { StrategyForm } from "@/components/strategy-form";
import { formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type StrategyRecord = {
  id: string;
  name: string;
  protocol: string;
  network: string;
  assetSymbol: string;
  currentYield: number;
  targetYield: number;
  riskScore: number;
  status: "ACTIVE" | "PAUSED" | "WATCHLIST" | "AT_RISK";
  metadata?: Record<string, unknown> | null;
};

export function StrategiesManager({ strategies }: { strategies: StrategyRecord[] }) {
  const [strategyList, setStrategyList] = useState(strategies);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(strategies[0]?.id ?? null);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    setStrategyList(strategies);
    setSelectedStrategyId((current) => {
      if (current && strategies.some((strategy) => strategy.id === current)) {
        return current;
      }

      return strategies[0]?.id ?? null;
    });
  }, [strategies]);

  const selectedStrategy = strategyList.find((strategy) => strategy.id === selectedStrategyId) ?? null;

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <StrategyForm
        mode={selectedStrategy ? "edit" : "create"}
        resetToken={resetToken}
        strategy={selectedStrategy}
        onCreateNew={() => {
          setSelectedStrategyId(null);
          setResetToken((current) => current + 1);
        }}
        onSaved={(savedStrategy) => {
          setStrategyList((current) => {
            const exists = current.some((strategy) => strategy.id === savedStrategy.id);

            if (exists) {
              return current.map((strategy) => (strategy.id === savedStrategy.id ? savedStrategy : strategy));
            }

            return [savedStrategy, ...current];
          });
          setSelectedStrategyId(savedStrategy.id);
        }}
      />

      <div className="space-y-4">
        {strategyList.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-sm text-muted-foreground">
              No strategies yet. Add one to start tracking treasury posture and agent opportunities.
            </CardContent>
          </Card>
        ) : null}

        {strategyList.map((strategy) => {
          const isSelected = strategy.id === selectedStrategyId;

          return (
            <Card
              key={strategy.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedStrategyId(strategy.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStrategyId(strategy.id);
                }
              }}
              className={cn(
                "cursor-pointer transition hover:border-cyan-300/30 hover:shadow-[0_24px_80px_rgba(6,182,212,0.1)]",
                isSelected ? "border-cyan-300/30 bg-slate-950 text-white" : ""
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={cn("eyebrow", isSelected ? "text-cyan-200" : "")}>Strategy dossier</p>
                    <CardTitle className="mt-3">{strategy.name}</CardTitle>
                    <CardDescription className={cn(isSelected ? "text-slate-300" : "")}>
                      {strategy.protocol} • {strategy.network} • {strategy.assetSymbol}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected ? <Badge variant="info">Editing</Badge> : null}
                    <StatusChip value={strategy.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className={cn("ledger-strip", isSelected ? "bg-white/5 text-white" : "")}>
                  <p className={cn("eyebrow", isSelected ? "text-cyan-200" : "")}>Current</p>
                  <p className="mt-2 text-xl font-semibold">{formatPercent(strategy.currentYield)}</p>
                </div>
                <div className={cn("ledger-strip", isSelected ? "bg-white/5 text-white" : "")}>
                  <p className={cn("eyebrow", isSelected ? "text-cyan-200" : "")}>Target</p>
                  <p className="mt-2 text-xl font-semibold">{formatPercent(strategy.targetYield)}</p>
                </div>
                <div className={cn("ledger-strip", isSelected ? "bg-white/5 text-white" : "")}>
                  <p className={cn("eyebrow", isSelected ? "text-cyan-200" : "")}>Risk</p>
                  <p className="mt-2 text-xl font-semibold">{strategy.riskScore.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
