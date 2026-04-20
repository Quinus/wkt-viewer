import {
  PlusIcon,
  CaretDoubleUpIcon,
  CaretDoubleDownIcon,
  SidebarSimpleIcon,
  FolderPlusIcon,
  ExportIcon,
} from "@phosphor-icons/react";

interface WktPanelToolbarProps {
  collapsed: boolean;
  allCollapsed: boolean;
  hasAnyContent: boolean;
  onToggleCollapse: () => void;
  onToggleCollapseAll: () => void;
  onAddEntry: () => void;
  onCreateGroup: () => void;
  onOpenShareDialog: () => void;
}

export function WktPanelToolbar({
  collapsed,
  allCollapsed,
  hasAnyContent,
  onToggleCollapse,
  onToggleCollapseAll,
  onAddEntry,
  onCreateGroup,
  onOpenShareDialog,
}: WktPanelToolbarProps) {
  const buttonClass =
    "flex items-center justify-center size-8 rounded-lg text-zinc-500 cursor-pointer transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-800 hover:scale-105 active:scale-95";

  return (
    <div className="flex items-center justify-between px-3 h-14 border-b border-zinc-200/70 flex-shrink-0 bg-gradient-to-b from-white to-zinc-50/50">
      {!collapsed && (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-zinc-800 truncate">
            WKT Viewer
          </span>
        </div>
      )}
      <div className={`flex gap-1 ${collapsed ? "w-full justify-center" : ""}`}>
        <button
          className={buttonClass}
          onClick={onToggleCollapse}
          title={collapsed ? "Expand panel" : "Collapse panel"}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          <SidebarSimpleIcon size={16} weight={collapsed ? "bold" : "fill"} />
        </button>
        {!collapsed && (
          <>
            {hasAnyContent && (
              <button
                className={buttonClass}
                onClick={onToggleCollapseAll}
                title={allCollapsed ? "Expand all" : "Collapse all"}
                aria-label={allCollapsed ? "Expand all" : "Collapse all"}
              >
                {allCollapsed ? (
                  <CaretDoubleUpIcon size={16} weight="bold" />
                ) : (
                  <CaretDoubleDownIcon size={16} weight="bold" />
                )}
              </button>
            )}
            <button
              className={`${buttonClass} text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700`}
              onClick={onAddEntry}
              title="Add geometry"
              aria-label="Add geometry"
            >
              <PlusIcon size={18} weight="bold" />
            </button>
            <button
              className={buttonClass}
              onClick={onCreateGroup}
              title="New group"
              aria-label="New group"
            >
              <FolderPlusIcon size={16} weight="bold" />
            </button>
            <button
              className={buttonClass}
              onClick={onOpenShareDialog}
              title="Export & Share"
              aria-label="Export & Share"
            >
              <ExportIcon size={16} weight="bold" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
