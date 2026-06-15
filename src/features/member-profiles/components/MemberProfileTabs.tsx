import { BarChart3, Users } from "lucide-react";

type ActiveTab = "dashboard" | "members";

interface MemberProfileTabsProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

export function MemberProfileTabs({
  activeTab,
  onChange,
}: MemberProfileTabsProps) {
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "members" as const, label: "Membros", icon: Users },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
