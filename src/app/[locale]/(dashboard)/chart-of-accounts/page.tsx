"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface AccountNode {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: string;
  nature: string;
  level: number;
  isLeaf: boolean;
  isSystem: boolean;
  isActive: boolean;
  sectorTag: string | null;
  children: AccountNode[];
}

export default function ChartOfAccountsPage() {
  const t = useTranslations("accounts");
  const tc = useTranslations("common");
  const { data: tree, isLoading, refetch } = trpc.accounts.getTree.useQuery();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParent, setSelectedParent] = useState<AccountNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (!tree) return;
    const allIds = new Set<string>();
    const collect = (nodes: AccountNode[]) => {
      nodes.forEach((n) => {
        allIds.add(n.id);
        if (n.children) collect(n.children);
      });
    };
    collect(tree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => setExpandedNodes(new Set());

  const filterTree = (nodes: AccountNode[], term: string): AccountNode[] => {
    if (!term) return nodes;
    return nodes
      .map((node) => {
        const matchesSelf =
          node.nameAr.includes(term) ||
          node.nameEn.toLowerCase().includes(term.toLowerCase()) ||
          node.code.includes(term);
        const filteredChildren = filterTree(node.children ?? [], term);
        if (matchesSelf || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as AccountNode[];
  };

  const displayTree = searchTerm ? filterTree(tree ?? [], searchTerm) : tree;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <button
          onClick={() => {
            setSelectedParent(null);
            setShowAddForm(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + {t("addAccount")}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder={`${tc("search")}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none w-64"
        />
        <button
          onClick={expandAll}
          className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          توسيع الكل
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          طي الكل
        </button>
      </div>

      {/* Tree */}
      <div className="bg-card rounded-xl border border-border">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-1">{t("code")}</div>
          <div className="col-span-5">{t("name")}</div>
          <div className="col-span-2">{t("type")}</div>
          <div className="col-span-2">{t("nature")}</div>
          <div className="col-span-2 text-end">{tc("actions")}</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">{tc("loading")}</div>
        ) : displayTree && displayTree.length > 0 ? (
          <div className="divide-y divide-border/50">
            {displayTree.map((node) => (
              <AccountTreeNode
                key={node.id}
                node={node}
                expandedNodes={expandedNodes}
                onToggle={toggleNode}
                onAddChild={(parent) => {
                  setSelectedParent(parent);
                  setShowAddForm(true);
                }}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">{t("noAccounts")}</div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <AddAccountModal
          parent={selectedParent}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function AccountTreeNode({
  node,
  expandedNodes,
  onToggle,
  onAddChild,
  depth = 0,
  t,
}: {
  node: AccountNode;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parent: AccountNode) => void;
  depth?: number;
  t: any;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const typeColors = {
    ASSET: "bg-blue-50 text-blue-700",
    LIABILITY: "bg-red-50 text-red-700",
    EQUITY: "bg-purple-50 text-purple-700",
    REVENUE: "bg-green-50 text-green-700",
    EXPENSE: "bg-orange-50 text-orange-700",
  };

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-12 gap-4 px-4 py-2.5 items-center hover:bg-muted/50 transition-colors text-sm",
          !node.isLeaf && "font-medium"
        )}
      >
        <div className="col-span-1 font-mono text-xs">{node.code}</div>
        <div className="col-span-5 flex items-center gap-2">
          <div style={{ paddingInlineStart: `${depth * 20}px` }} className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => onToggle(node.id)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted text-xs"
              >
                {isExpanded ? "▾" : "◂"}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span>{node.nameAr}</span>
            <span className="text-muted-foreground text-xs">({node.nameEn})</span>
            {node.isSystem && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                نظام
              </span>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              typeColors[node.type as keyof typeof typeColors] ?? ""
            }`}
          >
            {t(`types.${node.type}`)}
          </span>
        </div>
        <div className="col-span-2 text-xs">
          {t(`natures.${node.nature}`)}
        </div>
        <div className="col-span-2 text-end">
          <button
            onClick={() => onAddChild(node)}
            className="text-xs text-primary hover:underline"
          >
            + فرعي
          </button>
        </div>
      </div>
      {isExpanded &&
        hasChildren &&
        node.children.map((child) => (
          <AccountTreeNode
            key={child.id}
            node={child}
            expandedNodes={expandedNodes}
            onToggle={onToggle}
            onAddChild={onAddChild}
            depth={depth + 1}
            t={t}
          />
        ))}
    </>
  );
}

function AddAccountModal({
  parent,
  onClose,
  onSuccess,
}: {
  parent: AccountNode | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("accounts");
  const [formData, setFormData] = useState({
    code: parent ? `${parent.code}` : "",
    nameAr: "",
    nameEn: "",
    type: (parent?.type ?? "ASSET") as "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
    nature: (parent?.nature ?? "DEBIT") as "DEBIT" | "CREDIT",
  });

  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({
      ...formData,
      parentId: parent?.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {parent ? `${t("addChild")} — ${parent.nameAr}` : t("addAccount")}
        </h2>

        {createAccount.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createAccount.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("code")}</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("nameAr")}</label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("nameEn")}</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("type")}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ASSET">{t("types.ASSET")}</option>
                <option value="LIABILITY">{t("types.LIABILITY")}</option>
                <option value="EQUITY">{t("types.EQUITY")}</option>
                <option value="REVENUE">{t("types.REVENUE")}</option>
                <option value="EXPENSE">{t("types.EXPENSE")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("nature")}</label>
              <select
                value={formData.nature}
                onChange={(e) => setFormData({ ...formData, nature: e.target.value as typeof formData.nature })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DEBIT">{t("natures.DEBIT")}</option>
                <option value="CREDIT">{t("natures.CREDIT")}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createAccount.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createAccount.isPending ? "..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
