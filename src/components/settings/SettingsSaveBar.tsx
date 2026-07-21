type SettingsSaveBarProps = {
  saveLabel: string;
  saving: boolean;
  disabled: boolean;
  error: string | null;
  onSave: () => void;
};

export function SettingsSaveBar({
  saveLabel,
  saving,
  disabled,
  error,
  onSave,
}: SettingsSaveBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 border-t border-white/10 bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-4 py-3 backdrop-blur-sm sm:-mx-5 sm:px-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {error ? (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        ) : (
          <span className="hidden text-xs text-zinc-500 sm:block" aria-hidden />
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || saving}
          className="self-end rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-50 sm:self-auto"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
