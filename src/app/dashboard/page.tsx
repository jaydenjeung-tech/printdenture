"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { loadOrderDraft, formatDraftSavedAt } from "@/lib/order-draft";
import { formatCaseNumber } from "@/lib/case-number";
import { isPracticeProfileComplete } from "@/lib/profile-requirements";
import WorkflowReadinessCard from "@/components/workflow-readiness-card";
import CompleteProfileModal, { type CompleteProfile } from "@/components/complete-profile-modal";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  DashboardDraftBanner,
  DashboardEmptyState,
  DashboardFilters,
  DashboardHeader,
  DashboardLoadingState,
  DashboardOrderCard,
  DashboardPracticeCard,
  DashboardProfileModal,
  DashboardStatGrid,
  STATUS_STEPS,
  type DashboardOrder,
  type DashboardProfile,
} from "@/components/marketing/dashboard-ui";

function DashboardContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [needsPracticeProfile, setNeedsPracticeProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount" | "status">("newest");
  const [statusFilter, setStatusFilter] = useState<"all" | "inprogress" | "shipped" | "delivered">("all");
  const [orderDraft, setOrderDraft] = useState<{ productName: string; savedAt: string; step: number } | null>(null);

  useEffect(() => {
    const draft = loadOrderDraft();
    if (draft?.productId && draft.step >= 2) {
      setOrderDraft({
        productName: `Step ${draft.step} saved`,
        savedAt: draft.savedAt,
        step: draft.step,
      });
    }
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createAppClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      const [{ data: profileData }, { data: ordersData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileData) setProfile(profileData);
      setNeedsPracticeProfile(!isPracticeProfileComplete(profileData));
      if (ordersData) setOrders(ordersData);
      setLoading(false);
    }
    void load();
  }, [router]);

  function handleReorder(order: DashboardOrder) {
    router.push(`/order?reorder=${order.id}`);
  }

  function handlePracticeProfileComplete(updated: CompleteProfile) {
    setProfile(updated as DashboardProfile);
    setNeedsPracticeProfile(false);
  }

  if (loading) {
    return (
      <MarketingShell>
        <DashboardLoadingState />
      </MarketingShell>
    );
  }

  const nonRemakeOrders = orders.filter((o) => !o.is_remake && o.order_type !== "equipment");
  const inProgressOrders = orders.filter((o) => ["received", "printing", "qc"].includes(o.status) && !o.is_remake);
  const shippedOrders = orders.filter((o) => ["shipped", "delivered"].includes(o.status));

  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === "inprogress" && !["received", "printing", "qc"].includes(o.status)) return false;
      if (statusFilter === "shipped" && o.status !== "shipped") return false;
      if (statusFilter === "delivered" && o.status !== "delivered") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const caseNum = formatCaseNumber(o.case_number) ?? "";
        const teeth = o.tooth_numbers?.map((n) => `#${n}`).join(" ") || "";
        if (
          !caseNum.includes(q) &&
          !o.id.toLowerCase().includes(q) &&
          !o.product_name.toLowerCase().includes(q) &&
          !teeth.includes(q) &&
          !(o.shade?.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "amount") return b.total_price - a.total_price;
      if (sortBy === "status") return STATUS_STEPS.indexOf(b.status) - STATUS_STEPS.indexOf(a.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <MarketingShell>
      {needsPracticeProfile && userId && (
        <CompleteProfileModal
          profile={profile as CompleteProfile | null}
          userId={userId}
          onComplete={handlePracticeProfileComplete}
        />
      )}
      {showProfileModal && profile && (
        <DashboardProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}

      <DashboardHeader
        profile={profile}
        caseCount={nonRemakeOrders.length}
        onEditProfile={() => setShowProfileModal(true)}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 pb-16">
        {orderDraft && (
          <DashboardDraftBanner step={orderDraft.step} savedAt={formatDraftSavedAt(orderDraft.savedAt)} />
        )}

        {orders.length > 0 && (
          <DashboardStatGrid
            stats={[
              { label: "Total cases", value: nonRemakeOrders.length },
              { label: "In progress", value: inProgressOrders.length },
              { label: "Shipped", value: shippedOrders.length },
            ]}
          />
        )}

        {profile && userId && (
          <WorkflowReadinessCard
            userId={userId}
            profile={{
              jb_tray_status: profile.jb_tray_status,
              jb_fork_status: profile.jb_fork_status,
              jb_tray_trained: profile.jb_tray_trained,
              jb_fork_trained: profile.jb_fork_trained,
            }}
            onUpdate={(patch) => setProfile((prev) => (prev ? { ...prev, ...patch } : prev))}
          />
        )}

        {profile?.practice_name && (
          <DashboardPracticeCard profile={profile} onEdit={() => setShowProfileModal(true)} />
        )}

        {orders.length > 0 && (
          <DashboardFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {orders.length === 0 ? (
          <DashboardEmptyState />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--pd-border-strong)] bg-white">
            <p className="text-[14px] text-[var(--pd-slate)]">No cases match your search.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-[13px] text-[var(--pd-teal-dark)] hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <DashboardOrderCard key={order.id} order={order} onReorder={handleReorder} />
            ))}
          </div>
        )}
      </div>
    </MarketingShell>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
