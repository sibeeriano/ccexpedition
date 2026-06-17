import { useTranslation } from "react-i18next";

export type WorkspaceTabId = "future" | "news" | "dashboard" | "profile";

type WorkspaceTabsProps = {
  activeTab: WorkspaceTabId;
  onFuture: () => void;
  onNews: () => void;
  onDashboard: () => void;
  onProfile: () => void;
};

const TABS: { id: WorkspaceTabId; labelKey: string; tourId?: string }[] = [
  { id: "future", labelKey: "future.cta" },
  { id: "news", labelKey: "news.cta" },
  { id: "dashboard", labelKey: "dashboard.cta" },
  { id: "profile", labelKey: "profile.cta", tourId: "profile-link" },
];

export function WorkspaceTabs({
  activeTab,
  onFuture,
  onNews,
  onDashboard,
  onProfile,
}: WorkspaceTabsProps) {
  const { t } = useTranslation();

  const handlers: Record<WorkspaceTabId, () => void> = {
    future: onFuture,
    news: onNews,
    dashboard: onDashboard,
    profile: onProfile,
  };

  return (
    <nav
      role="tablist"
      aria-label={t("nav.workspaceTabs")}
      className="folder-tabs"
    >
      <div className="folder-tabs__track">
        {TABS.map(({ id, labelKey, tourId }, index) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-tour={tourId}
              onClick={handlers[id]}
              style={{ zIndex: isActive ? 10 : index + 1 }}
              className={`folder-tab folder-tab--${id}${
                isActive ? " folder-tab--active" : ""
              }`}
            >
              <span className="folder-tab__label">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
