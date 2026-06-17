import { useTranslation } from "react-i18next";
import {
  getPresetId,
  type ColorPreset,
} from "../../utils/theme";

export const ALERT_CURRENCIES = ["$", "€", "ARS"] as const;

export function SettingsDivider() {
  return <hr className="border-0 border-t border-white/10" />;
}

type SettingsCheckboxProps = {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingsCheckbox({
  id,
  label,
  hint,
  checked,
  onChange,
}: SettingsCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-md py-0.5"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-base text-white focus:ring-white/20"
      />
      <span className="min-w-0">
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-xs text-zinc-500">{hint}</span>
        )}
      </span>
    </label>
  );
}

type ColorPickerFieldProps = {
  label: string;
  color: string;
  presets: ColorPreset[];
  defaultColor: string;
  inputId: string;
  onChange: (color: string) => void;
};

export function ColorPickerField({
  label,
  color,
  presets,
  defaultColor,
  inputId,
  onChange,
}: ColorPickerFieldProps) {
  const { t } = useTranslation();
  const presetId = getPresetId(presets, color);
  const activeLabel = presetId
    ? t(`theme.presets.${presetId}`)
    : t("common.custom");

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = color === preset.color;
          const presetLabel = t(`theme.presets.${preset.id}`);
          return (
            <button
              key={preset.id}
              type="button"
              title={presetLabel}
              aria-label={`${presetLabel} ${label}`}
              aria-pressed={isSelected}
              onClick={() => onChange(preset.color)}
              className={`size-9 rounded-md border transition-transform hover:scale-105 ${
                isSelected
                  ? "border-white/50 ring-2 ring-white/20"
                  : "border-white/10"
              }`}
              style={{ backgroundColor: preset.color }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-md border border-white/10 bg-transparent p-0.5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-mono text-sm text-zinc-200">
            {color}
          </span>
          <span className="text-xs text-zinc-500">{activeLabel}</span>
        </div>
        {color !== defaultColor && (
          <button
            type="button"
            onClick={() => onChange(defaultColor)}
            className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t("common.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
