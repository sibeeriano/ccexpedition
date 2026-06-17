import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { applyRememberMe, getRememberMe } from "../lib/supabase";
import { type AppSettings, settingsSnapshot } from "../utils/settings";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { Modal } from "./Modal";
import { ConfirmDeleteAccountModal } from "./ConfirmDeleteAccountModal";
import { LanguageToggle } from "./LanguageToggle";
import { SettingsCheckbox } from "./settings/SettingsFields";
import { CardsSection } from "./settings/CardsSection";
import { PersonalizationSection } from "./settings/PersonalizationSection";
import { TutorialSection } from "./settings/TutorialSection";

type ProfileViewProps = {
  onBack: () => void;
  demoMode?: boolean;
};

type ProfileSectionId =
  | "tutorial"
  | "personalization"
  | "cards"
  | "data"
  | "account";

function ProfileCard({
  sectionId,
  title,
  description,
  children,
  action,
  open,
  onToggle,
}: {
  sectionId: ProfileSectionId;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  open: boolean;
  onToggle: (sectionId: ProfileSectionId) => void;
}) {
  const panelId = useId();

  return (
    <article className="panel-surface overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(sectionId)}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left transition-colors hover:opacity-90"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-white sm:text-lg">
              {title}
            </span>
            {description && (
              <span className="mt-1 block text-sm text-zinc-400">{description}</span>
            )}
          </span>
          <span
            aria-hidden
            className={`mt-1 shrink-0 text-xs text-zinc-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        {action && (
          <div
            className="shrink-0"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {action}
          </div>
        )}
      </div>
      {open && (
        <div
          id={panelId}
          className="border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5"
        >
          {children}
        </div>
      )}
    </article>
  );
}

const DEFAULT_OPEN_SECTIONS: Record<ProfileSectionId, boolean> = {
  tutorial: false,
  personalization: false,
  cards: false,
  data: false,
  account: false,
};

export function ProfileView({ onBack, demoMode = false }: ProfileViewProps) {
  const { t } = useTranslation();
  const { session, deleteAccount, resetPassword } = useAuth();
  const { state, applySettings, setLanguage } = useApp();
  const [draft, setDraft] = useState<AppSettings>(() => ({ ...state.settings }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(() => getRememberMe());
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);
  const [exportComingSoonOpen, setExportComingSoonOpen] = useState(false);

  const settingsDirty =
    settingsSnapshot(draft) !== settingsSnapshot(state.settings);
  const email = session?.user.email ?? "";

  function patchDraft(patch: Partial<AppSettings>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSaveSettings() {
    setSaving(true);
    setSaveError(null);
    const errorMessage = await applySettings(draft);
    setSaving(false);
    if (errorMessage) {
      setSaveError(errorMessage);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  const saveLabel = saving
    ? t("common.saving")
    : saved
      ? t("settings.saved")
      : t("common.save");

  function handleExportCsv() {
    setExportComingSoonOpen(true);
  }

  function handleKeepSignedInChange(checked: boolean) {
    setKeepSignedIn(checked);
    applyRememberMe(checked);
  }

  async function handleSendRecoveryEmail() {
    if (!email || sendingRecovery || demoMode) return;
    setSendingRecovery(true);
    setRecoverySent(false);
    const errorMessage = await resetPassword(email);
    setSendingRecovery(false);
    if (!errorMessage) {
      setRecoverySent(true);
    }
  }

  function toggleSection(sectionId: ProfileSectionId) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer self-start text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          ← {t("profile.backToApp")}
        </button>
        <h1 className="text-lg font-bold text-white sm:text-xl">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-zinc-400">{t("profile.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3">
        <ProfileCard
          sectionId="tutorial"
          title={t("settings.tutorial")}
          description={t("profile.tutorialHint")}
          open={openSections.tutorial}
          onToggle={toggleSection}
        >
          <TutorialSection demoMode={demoMode} onStartTour={onBack} />
        </ProfileCard>

        <ProfileCard
          sectionId="personalization"
          title={t("profile.personalization")}
          description={t("profile.personalizationHint")}
          open={openSections.personalization}
          onToggle={toggleSection}
          action={
            openSections.personalization || settingsDirty || saved ? (
              <div className="flex shrink-0 flex-col items-end gap-1">
                {saveError && (
                  <span role="alert" className="max-w-32 truncate text-xs text-red-400">
                    {saveError}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving || (!settingsDirty && !saved)}
                  className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-50"
                >
                  {saveLabel}
                </button>
              </div>
            ) : undefined
          }
        >
          <PersonalizationSection draft={draft} patchDraft={patchDraft} />
        </ProfileCard>

        <ProfileCard
          sectionId="cards"
          title={t("settings.cards")}
          description={t("profile.cardsHint")}
          open={openSections.cards}
          onToggle={toggleSection}
        >
          <CardsSection />
        </ProfileCard>

        <ProfileCard
          sectionId="data"
          title={t("profile.data")}
          description={t("profile.dataHint")}
          open={openSections.data}
          onToggle={toggleSection}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-200">{t("profile.exportCsv")}</p>
              <p className="text-xs text-zinc-500">{t("profile.exportCsvHint")}</p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="self-start rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 sm:self-auto"
            >
              {t("profile.exportCsv")}
            </button>
          </div>
        </ProfileCard>

        <ProfileCard
          sectionId="account"
          title={t("profile.account")}
          description={t("profile.accountHint")}
          open={openSections.account}
          onToggle={toggleSection}
        >
          {demoMode ? (
            <p className="text-sm text-zinc-400">{t("profile.demoAccountHint")}</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              <div className="flex flex-col gap-1 pb-4">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t("profile.userEmail")}
                </span>
                <span className="break-all text-sm text-white">{email}</span>
              </div>

              <div className="flex flex-col gap-2 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-200">{t("profile.changePassword")}</p>
                    <p className="text-xs text-zinc-500">
                      {t("profile.changePasswordShortHint")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setChangePasswordOpen(true)}
                      className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
                    >
                      {t("profile.changePassword")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSendRecoveryEmail()}
                      disabled={sendingRecovery}
                      className="rounded-md border border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 disabled:opacity-50"
                    >
                      {sendingRecovery
                        ? t("login.pleaseWait")
                        : t("profile.sendRecoveryEmail")}
                    </button>
                  </div>
                </div>
                {recoverySent && (
                  <p className="text-xs text-emerald-400">{t("login.resetEmailSent")}</p>
                )}
              </div>

              <div className="py-4">
                <SettingsCheckbox
                  id="profile-keep-signed-in"
                  label={t("login.keepSignedIn")}
                  hint={t("profile.keepSignedInHint")}
                  checked={keepSignedIn}
                  onChange={handleKeepSignedInChange}
                />
              </div>

              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-200">{t("settings.language")}</p>
                  <p className="text-xs text-zinc-500">{t("profile.languageHint")}</p>
                </div>
                <LanguageToggle
                  language={state.settings.language}
                  onLanguageChange={(lang) => {
                    patchDraft({ language: lang });
                    setLanguage(lang);
                  }}
                />
              </div>

              <div className="pt-4">
                <p className="text-sm text-zinc-200">{t("profile.deleteAccount")}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("profile.deleteAccountShortHint")}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteAccountOpen(true)}
                  className="mt-3 rounded-md border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  {t("profile.deleteAccount")}
                </button>
              </div>
            </div>
          )}
        </ProfileCard>
      </div>

      {exportComingSoonOpen && (
        <Modal
          title={t("profile.exportComingSoon")}
          onClose={() => setExportComingSoonOpen(false)}
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src="/gatito2.png"
              alt=""
              className="max-h-52 w-auto object-contain"
            />
            <p className="text-center text-sm text-zinc-400">
              {t("profile.exportComingSoonHint")}
            </p>
          </div>
        </Modal>
      )}

      {changePasswordOpen && (
        <ChangePasswordModal
          email={email}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}

      {deleteAccountOpen && (
        <ConfirmDeleteAccountModal
          onClose={() => setDeleteAccountOpen(false)}
          onConfirm={deleteAccount}
        />
      )}
    </section>
  );
}
