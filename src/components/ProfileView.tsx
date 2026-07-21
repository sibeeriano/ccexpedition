import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { applyRememberMe, getRememberMe } from "../lib/supabase";
import { type AppSettings, settingsSnapshot } from "../utils/settings";
import { applyTheme } from "../utils/theme";
import { Modal } from "./Modal";
import { AccountSection } from "./settings/AccountSection";
import { AppearanceSection } from "./settings/AppearanceSection";
import { CardsSection } from "./settings/CardsSection";
import { HelpSection } from "./settings/HelpSection";
import { PreferencesSection } from "./settings/PreferencesSection";
import { ProfileSummary } from "./settings/ProfileSummary";
import { SettingsNav, type SettingsSectionId } from "./settings/SettingsNav";
import { SettingsSaveBar } from "./settings/SettingsSaveBar";

type ProfileViewProps = {
  onStartTour: () => void;
  demoMode?: boolean;
};

const SECTION_HINT_KEYS: Record<SettingsSectionId, string> = {
  appearance: "profile.appearanceHint",
  preferences: "profile.preferencesHint",
  cards: "profile.cardsHint",
  account: "profile.accountHint",
  help: "profile.helpHint",
};

const SECTIONS_WITH_SAVE: SettingsSectionId[] = ["appearance", "preferences"];

function applyPersonalizationTheme(settings: AppSettings) {
  applyTheme({
    backgroundColor: settings.backgroundColor,
    titleColor: settings.titleColor,
    titleText: settings.titleText,
    budgetAlertColor: settings.budgetAlertColor,
    cardColumnColor: settings.cardColumnColor,
    tabFutureColor: settings.tabFutureColor,
    tabFutureTextColor: settings.tabFutureTextColor,
    tabNewsColor: settings.tabNewsColor,
    tabNewsTextColor: settings.tabNewsTextColor,
    tabDashboardColor: settings.tabDashboardColor,
    tabDashboardTextColor: settings.tabDashboardTextColor,
    tabProfileColor: settings.tabProfileColor,
    tabProfileTextColor: settings.tabProfileTextColor,
    visualTheme: settings.visualTheme,
  });
}

export function ProfileView({ onStartTour, demoMode = false }: ProfileViewProps) {
  const { t } = useTranslation();
  const { session, deleteAccount, resetPassword } = useAuth();
  const { state, applySettings, setLanguage } = useApp();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("appearance");
  const [draft, setDraft] = useState<AppSettings>(() => ({ ...state.settings }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [keepSignedIn, setKeepSignedIn] = useState(() => getRememberMe());
  const [exportComingSoonOpen, setExportComingSoonOpen] = useState(false);
  const savedSettingsRef = useRef(state.settings);
  savedSettingsRef.current = state.settings;

  const settingsDirty =
    settingsSnapshot(draft) !== settingsSnapshot(state.settings);
  const email = session?.user.email ?? "";
  const showSaveBar = SECTIONS_WITH_SAVE.includes(activeSection);

  function patchDraft(patch: Partial<AppSettings>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      applyPersonalizationTheme(next);
      return next;
    });
    setSaved(false);
    setSaveError(null);
  }

  useEffect(() => {
    return () => {
      applyPersonalizationTheme(savedSettingsRef.current);
    };
  }, []);

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

  function handleKeepSignedInChange(checked: boolean) {
    setKeepSignedIn(checked);
    applyRememberMe(checked);
  }

  async function handleSendRecoveryEmail(): Promise<boolean> {
    if (!email || demoMode) return false;
    const errorMessage = await resetPassword(email);
    return !errorMessage;
  }

  function renderSectionContent() {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSection draft={draft} patchDraft={patchDraft} />;
      case "preferences":
        return (
          <PreferencesSection
            draft={draft}
            patchDraft={patchDraft}
            onLanguageChange={setLanguage}
            onExportCsv={() => setExportComingSoonOpen(true)}
          />
        );
      case "cards":
        return <CardsSection />;
      case "account":
        return (
          <AccountSection
            demoMode={demoMode}
            email={email}
            keepSignedIn={keepSignedIn}
            onKeepSignedInChange={handleKeepSignedInChange}
            onSendRecoveryEmail={handleSendRecoveryEmail}
            onDeleteAccount={deleteAccount}
          />
        );
      case "help":
        return <HelpSection demoMode={demoMode} onStartTour={onStartTour} />;
      default:
        return null;
    }
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold text-white sm:text-xl">
          {t("profile.settingsTitle")}
        </h1>
        <p className="text-sm text-zinc-400">{t("profile.settingsSubtitle")}</p>
      </div>

      <ProfileSummary draft={draft} cardCount={state.cards.length} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <SettingsNav active={activeSection} onChange={setActiveSection} />

        <article className="panel-surface min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
          <header className="mb-5 border-b border-white/10 pb-4">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              {t(`profile.nav.${activeSection}`)}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {t(SECTION_HINT_KEYS[activeSection])}
            </p>
          </header>

          {renderSectionContent()}

          {showSaveBar && (
            <SettingsSaveBar
              saveLabel={saveLabel}
              saving={saving}
              disabled={!settingsDirty && !saved}
              error={saveError}
              onSave={() => void handleSaveSettings()}
            />
          )}
        </article>
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
    </section>
  );
}
