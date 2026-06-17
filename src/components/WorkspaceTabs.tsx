import { useTranslation } from "react-i18next";
import { useIsNarrowScreen } from "../hooks/useIsNarrowScreen";

export type WorkspaceTabId = "future" | "news" | "dashboard" | "profile";

type WorkspaceTabsProps = {
  activeTab: WorkspaceTabId;
  onFuture: () => void;
  onNews: () => void;
  onDashboard: () => void;
  onProfile: () => void;
};

const TABS: {
  id: WorkspaceTabId;
  labelKey: string;
  shortLabelKey: string;
  tourId?: string;
}[] = [
  { id: "future", labelKey: "future.cta", shortLabelKey: "future.ctaShort" },
  { id: "news", labelKey: "news.cta", shortLabelKey: "news.ctaShort" },
  {
    id: "dashboard",
    labelKey: "dashboard.cta",
    shortLabelKey: "dashboard.ctaShort",
  },
  {
    id: "profile",
    labelKey: "profile.cta",
    shortLabelKey: "profile.ctaShort",
    tourId: "profile-link",
  },
];

export function WorkspaceTabs({
  activeTab,
  onFuture,
  onNews,
  onDashboard,
  onProfile,
}: WorkspaceTabsProps) {
  const { t } = useTranslation();
  const isNarrow = useIsNarrowScreen();

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
        {TABS.map(({ id, labelKey, shortLabelKey, tourId }, index) => {
          const isActive = activeTab === id;
          const label = t(isNarrow ? shortLabelKey : labelKey);
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t(labelKey)}
              data-tour={tourId}
              onClick={handlers[id]}
              style={{ zIndex: isActive ? 10 : index + 1 }}
              className={`folder-tab folder-tab--${id}${
                isActive ? " folder-tab--active" : ""
              }`}
            >
              <span className="folder-tab__label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
