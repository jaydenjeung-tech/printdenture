"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  AdminOrderDetailLayout,
  AdminOrderDetailLoading,
  AdminOrderDetailRemakeModal,
  REMAKE_REASONS,
  type AdminOrderDetailMessage,
  type AdminOrderDetailOrder,
  type AdminOrderDetailProfile,
  type AdminOrderDetailRx,
  type AdminOrderDetailStatusHistory,
} from "@/components/admin/admin-order-detail-ui";
import type { DesignOutsourceFields } from "@/lib/design-outsource";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<AdminOrderDetailOrder | null>(null);
  const [originalOrder, setOriginalOrder] = useState<AdminOrderDetailOrder | null>(null);
  const [profile, setProfile] = useState<AdminOrderDetailProfile | null>(null);
  const [rx, setRx] = useState<AdminOrderDetailRx | null>(null);
  const [messages, setMessages] = useState<AdminOrderDetailMessage[]>([]);
  const [statusHistory, setStatusHistory] = useState<AdminOrderDetailStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showRemakeModal, setShowRemakeModal] = useState(false);
  const [remakeReason, setRemakeReason] = useState("");
  const [remakeNote, setRemakeNote] = useState("");
  const [submittingRemake, setSubmittingRemake] = useState(false);
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [defaultPartnerEmail, setDefaultPartnerEmail] = useState("");

  useEffect(() => {
    void fetch("/api/admin/design-outsource")
      .then((r) => r.json())
      .then((data) => {
        if (data.defaultPartnerEmail) setDefaultPartnerEmail(data.defaultPartnerEmail);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await verifyAdminAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? "/auth" : "/dashboard");
        return;
      }
      await loadAll(access.supabase);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function loadAll(supabase: ReturnType<typeof createAppClient>) {
    const { data: orderData } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!orderData) {
      router.push("/admin/orders");
      return;
    }
    setOrder(orderData);
    setTrackingInput(orderData.tracking_number || "");

    if (orderData.product_id) {
      const { data: productData } = await supabase
        .from("products")
        .select("category")
        .eq("id", orderData.product_id)
        .single();
      setProductCategory(productData?.category ?? null);
    } else {
      setProductCategory(null);
    }

    if (orderData.remake_of) {
      const { data: origData } = await supabase.from("orders").select("*").eq("id", orderData.remake_of).single();
      setOriginalOrder(origData);
    } else {
      setOriginalOrder(null);
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("practice_name, phone")
      .eq("id", orderData.user_id)
      .single();
    setProfile(profileData);

    const { data: rxData } = await supabase.from("rx").select("*").eq("order_id", orderId).single();
    setRx(rxData);

    const { data: msgData } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (msgData?.length) {
      const senderIds = [...new Set(msgData.map((m) => m.sender_id))];
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, practice_name")
        .in("id", senderIds);
      const nameMap: Record<string, string> = {};
      senderProfiles?.forEach((p) => {
        nameMap[p.id] = p.first_name
          ? `${p.first_name} ${p.last_name || ""}`.trim()
          : p.practice_name || "Unknown";
      });
      setMessages(msgData.map((m) => ({ ...m, sender_name: nameMap[m.sender_id] || "Unknown" })));
    } else {
      setMessages([]);
    }

    const { data: historyData } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setStatusHistory(historyData || []);

    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setSaving(true);
    const supabase = createAppClient();
    const { user } = await getClientUser(supabase);

    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      changed_by: user?.id,
      from_status: order.status,
      to_status: newStatus,
    });

    setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    setStatusHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from_status: order.status,
        to_status: newStatus,
        created_at: new Date().toISOString(),
      },
    ]);
    setSaving(false);
  }

  async function updateTracking() {
    if (!order) return;
    setSaving(true);
    const supabase = createAppClient();
    const { user } = await getClientUser(supabase);

    await supabase
      .from("orders")
      .update({ tracking_number: trackingInput || null, status: "shipped" })
      .eq("id", orderId);

    if (order.status !== "shipped") {
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        changed_by: user?.id,
        from_status: order.status,
        to_status: "shipped",
      });
    }

    setOrder((prev) =>
      prev ? { ...prev, tracking_number: trackingInput, status: "shipped" } : null
    );
    setSaving(false);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const supabase = createAppClient();
    const { user } = await getClientUser(supabase);
    if (!user) return;

    const { data: inserted } = await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        sender_role: "admin",
        message: newMessage.trim(),
        is_internal: isInternal,
      })
      .select()
      .single();

    if (inserted) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      const senderName = prof?.first_name
        ? `${prof.first_name} ${prof.last_name || ""}`.trim()
        : "Admin";
      setMessages((prev) => [...prev, { ...inserted, sender_name: senderName }]);
    }

    setNewMessage("");
    setSendingMsg(false);
  }

  async function submitRemake() {
    if (!remakeReason || !order) return;
    setSubmittingRemake(true);
    const supabase = createAppClient();
    const { user } = await getClientUser(supabase);

    const { data: newOrder } = await supabase
      .from("orders")
      .insert({
        user_id: order.user_id,
        product_id: order.product_id,
        product_name: order.product_name,
        quantity: order.quantity,
        unit_price: 0,
        total_price: 0,
        status: "received",
        shade: order.shade,
        tooth_number: order.tooth_number,
        tooth_numbers: order.tooth_numbers,
        stl_file_path: order.stl_file_path,
        due_date: order.due_date,
        is_remake: true,
        remake_of: order.id,
        remake_reason: remakeReason,
        remake_note: remakeNote || null,
      })
      .select()
      .single();

    if (newOrder) {
      await supabase.from("order_messages").insert({
        order_id: order.id,
        sender_id: user?.id,
        sender_role: "admin",
        message: `Remake requested — ${REMAKE_REASONS.find((r) => r.value === remakeReason)?.label}${remakeNote ? `: ${remakeNote}` : ""}. New case: #${newOrder.id.slice(0, 6).toUpperCase()}`,
        is_internal: true,
      });

      setShowRemakeModal(false);
      setRemakeReason("");
      setRemakeNote("");
      router.push(`/admin/orders/${newOrder.id}`);
    }

    setSubmittingRemake(false);
  }

  if (loading) return <AdminOrderDetailLoading />;
  if (!order) return null;

  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers
        .sort((a, b) => a - b)
        .map((n) => `#${n}`)
        .join(", ")
    : order.tooth_number
      ? `#${order.tooth_number}`
      : null;

  const timeline = [
    ...statusHistory.map((h) => ({ type: "status" as const, data: h })),
    ...messages.map((m) => ({ type: "message" as const, data: m })),
  ].sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  return (
    <>
      {showRemakeModal && (
        <AdminOrderDetailRemakeModal
          order={order}
          remakeReason={remakeReason}
          remakeNote={remakeNote}
          submitting={submittingRemake}
          onReasonChange={setRemakeReason}
          onNoteChange={setRemakeNote}
          onClose={() => setShowRemakeModal(false)}
          onSubmit={() => void submitRemake()}
        />
      )}

      <AdminOrderDetailLayout
        order={order}
        originalOrder={originalOrder}
        profile={profile}
        rx={rx}
        productCategory={productCategory}
        defaultPartnerEmail={defaultPartnerEmail}
        timeline={timeline}
        trackingInput={trackingInput}
        saving={saving}
        newMessage={newMessage}
        isInternal={isInternal}
        sendingMsg={sendingMsg}
        teeth={teeth}
        onOutsourceSent={(fields: Partial<DesignOutsourceFields>) =>
          setOrder((prev) => (prev ? { ...prev, ...fields } : prev))
        }
        onRequestRemake={() => setShowRemakeModal(true)}
        onStatusChange={(status) => void updateStatus(status)}
        onTrackingChange={setTrackingInput}
        onShip={() => void updateTracking()}
        onNewMessageChange={setNewMessage}
        onToggleInternal={() => setIsInternal((v) => !v)}
        onSendMessage={() => void sendMessage()}
      />
    </>
  );
}
