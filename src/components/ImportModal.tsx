import { useCallback, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { formatMoney, formatMonthLabel, getCurrentMonth } from "../utils/format";
import { addMonths } from "../utils/months";
import {
  parseExpensesXlsx,
  type BankImportMode,
  type ParsedImportRow,
} from "../utils/xlsxImport";
import { AmountDisplay } from "./AmountDisplay";
import { Modal, useModalClose } from "./Modal";

type ImportModalProps = {
  onClose: () => void;
};

export function ImportModal({ onClose }: ImportModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={t("import.title")} onClose={onClose}>
      <ImportContent />
    </Modal>
  );
}

function ImportContent() {
  const { t } = useTranslation();
  const { state, addExpenses } = useApp();
  const close = useModalClose();
  const fileInputId = useId();

  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [format, setFormat] = useState<"bank" | "tracker" | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [bankImportMode, setBankImportMode] =
    useState<BankImportMode>("statement");
  const [statementMonth, setStatementMonth] = useState(getCurrentMonth());
  const [holderMap, setHolderMap] = useState<Record<string, string>>({});
  const [defaultCardId, setDefaultCardId] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uniqueHolders = [...new Set(rows.map((r) => r.cardholder).filter(Boolean))];
  const needsDefaultCard = format === "bank" || uniqueHolders.length === 0;

  function cardsForHolder(holder: string): Card[] {
    return state.cards.filter(
      (c) => c.holder.toLowerCase() === holder.toLowerCase(),
    );
  }

  function resolveCardId(row: ParsedImportRow): string | null {
    if (row.cardholder) return holderMap[row.cardholder] ?? null;
    return defaultCardId || null;
  }

  const parseBuffer = useCallback(
    (buffer: ArrayBuffer, mode: BankImportMode, month: string) => {
      const result = parseExpensesXlsx(buffer, {
        bankImportMode: mode,
        statementMonth: month,
      });
      setRows(result.rows);
      setParseErrors(result.errors);
      setSkipped(result.skipped);
      setFormat(result.format);
      return result;
    },
    [],
  );

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    setFileBuffer(buffer);
    const result = parseBuffer(buffer, bankImportMode, statementMonth);
    setError(null);

    const mapping: Record<string, string> = {};
    for (const holder of [
      ...new Set(result.rows.map((r) => r.cardholder).filter(Boolean)),
    ]) {
      const matches = cardsForHolder(holder);
      if (matches.length === 1) mapping[holder] = matches[0].id;
    }
    setHolderMap(mapping);
    setDefaultCardId(state.cards.length === 1 ? state.cards[0].id : "");
    e.target.value = "";
  }

  function handleBankImportModeChange(mode: BankImportMode) {
    setBankImportMode(mode);
    if (fileBuffer) parseBuffer(fileBuffer, mode, statementMonth);
  }

  function handleStatementMonthChange(month: string) {
    setStatementMonth(month);
    if (fileBuffer) parseBuffer(fileBuffer, bankImportMode, month);
  }

  const unmappedHolders = uniqueHolders.filter((h) => !holderMap[h]);
  const readyCount = rows.filter((r) => resolveCardId(r)).length;
  const canImport =
    readyCount > 0 &&
    unmappedHolders.length === 0 &&
    (!needsDefaultCard || !!defaultCardId);

  const statementPreviewTotal =
    format === "bank" && bankImportMode === "statement"
      ? rows.reduce(
          (sum, row) => sum + row.totalAmount / Math.max(1, row.installments),
          0,
        )
      : null;

  const monthOptions = Array.from({ length: 24 }, (_, i) =>
    addMonths(getCurrentMonth(), i - 12),
  );

  async function handleImport() {
    if (importing || !canImport) return;

    setImporting(true);
    setError(null);

    const expenses = rows
      .filter((r) => resolveCardId(r))
      .map((r) => ({
        cardId: resolveCardId(r)!,
        description: r.description,
        totalAmount: r.totalAmount,
        totalAmountUsd: r.totalAmountUsd,
        installments: r.installments,
        startMonth: r.startMonth,
        isMonthlyCharge: false,
      }));

    const errorMessage = await addExpenses(expenses);
    setImporting(false);

    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    close();
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        id={fileInputId}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        className="sr-only"
      />
      <label
        htmlFor={fileInputId}
        className="cursor-pointer rounded-md border border-dashed border-white/15 px-4 py-6 text-center text-sm text-zinc-400 transition-colors hover:border-white/30 hover:text-zinc-200"
      >
        {rows.length > 0
          ? t("import.rowsFound", {
              count: rows.length,
              format:
                format === "bank"
                  ? t("import.formatBank")
                  : t("import.formatTracker"),
            })
          : t("import.chooseFile")}
      </label>

      {parseErrors.length > 0 && (
        <div className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {parseErrors.slice(0, 5).map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      {skipped > 0 && (
        <p className="text-xs text-zinc-500">
          {t("import.rowsSkipped", { count: skipped })}
        </p>
      )}

      {format === "bank" && rows.length > 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-base px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("import.bankImportMode")}
          </p>
          <div className="flex flex-col gap-2 text-sm text-zinc-300">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="bank-import-mode"
                checked={bankImportMode === "statement"}
                onChange={() => handleBankImportModeChange("statement")}
                className="mt-0.5"
              />
              <span>
                {t("import.modeStatement")}
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="bank-import-mode"
                checked={bankImportMode === "purchases"}
                onChange={() => handleBankImportModeChange("purchases")}
                className="mt-0.5"
              />
              <span>
                {t("import.modePurchases")}
              </span>
            </label>
          </div>
          {bankImportMode === "statement" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="import-statement-month"
                className="text-xs font-medium text-zinc-400"
              >
                {t("import.statementMonth")}
              </label>
              <select
                id="import-statement-month"
                value={statementMonth}
                onChange={(e) => handleStatementMonthChange(e.target.value)}
                className="rounded-md border border-white/10 bg-base px-2 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
              {statementPreviewTotal !== null && (
                <p className="text-xs text-zinc-400">
                  {t("import.statementTotal", {
                    month: formatMonthLabel(statementMonth),
                    amount: formatMoney(statementPreviewTotal),
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {needsDefaultCard && rows.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="import-default-card"
            className="text-xs font-medium text-zinc-400"
          >
            {t("import.importToCard")}
          </label>
          <select
            id="import-default-card"
            value={defaultCardId}
            onChange={(e) => setDefaultCardId(e.target.value)}
            className="rounded-md border border-white/10 bg-base px-2 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            <option value="">{t("common.selectCard")}</option>
            {state.cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} ({card.holder})
              </option>
            ))}
          </select>
        </div>
      )}

      {uniqueHolders.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("import.mapHolders")}
          </p>
          {uniqueHolders.map((holder) => {
            const matches = cardsForHolder(holder);
            return (
              <div key={holder} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-sm text-zinc-300">
                  {holder}
                </span>
                <select
                  value={holderMap[holder] ?? ""}
                  onChange={(e) =>
                    setHolderMap((prev) => ({
                      ...prev,
                      [holder]: e.target.value,
                    }))
                  }
                  className="flex-1 rounded-md border border-white/10 bg-base px-2 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="">{t("common.selectCard")}</option>
                  {(matches.length > 0 ? matches : state.cards).map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.holder})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {rows.length > 0 && (
        <div className="max-h-48 overflow-auto rounded-md bg-base">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-left text-zinc-500">
                <th className="px-2 py-1.5 font-medium">
                  {t("common.description")}
                </th>
                <th className="px-2 py-1.5 text-right font-medium">
                  {t("import.total")}
                </th>
                <th className="px-2 py-1.5 text-right font-medium">
                  {t("import.cuotas")}
                </th>
                <th className="px-2 py-1.5 text-right font-medium">
                  {t("common.start")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row) => (
                <tr
                  key={row.rowIndex}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="max-w-32 truncate px-2 py-1 text-zinc-300">
                    {row.description}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <AmountDisplay
                      ars={row.totalAmount}
                      usd={row.totalAmountUsd}
                      className="items-end text-[11px]"
                    />
                  </td>
                  <td className="px-2 py-1 text-right text-zinc-400">
                    {row.isOneTime
                      ? t("common.oneTime")
                      : `${row.installments}x`}
                  </td>
                  <td className="px-2 py-1 text-right text-zinc-400">
                    {formatMonthLabel(row.startMonth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 20 && (
            <p className="px-2 py-1.5 text-center text-xs text-zinc-500">
              {t("import.andMore", { count: rows.length - 20 })}
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={importing || !canImport}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
        >
          {importing
            ? t("import.importing")
            : t("import.importCount", { count: readyCount })}
        </button>
      </div>
    </div>
  );
}
