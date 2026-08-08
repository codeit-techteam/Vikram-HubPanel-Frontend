"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  IdCard,
  Mail,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/axios";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store";
import { syncUserFromManager } from "@/store/userStore";
import type { ApiResponse } from "@/types/api";
import type { HubManager } from "@/types/auth";

function formatLastLogin(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const manager = useAuthStore((s) => s.manager);
  const setAuthState = useAuthStore.setState;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const me = await authService.getMe();
        if (cancelled) return;
        syncUserFromManager(me);
        setAuthState({
          manager: me,
          user: {
            id: me.id,
            name: me.name,
            email: me.email ?? "",
            role: me.role,
          },
        });
        setFullName(me.fullName || me.name || "");
        setEmail(me.email ?? "");
        setPhone(me.phone ?? me.mobile ?? "");
      } catch {
        if (!cancelled && manager) {
          setFullName(manager.fullName || manager.name || "");
          setEmail(manager.email ?? "");
          setPhone(manager.phone ?? manager.mobile ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh once on mount from API
  }, []);

  const initials = (manager?.name || fullName || "HM")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Full name is required");
      return;
    }

    setSaving(true);
    try {
      await api.patch<ApiResponse<unknown>>("/hub/profile", {
        fullName: trimmedName,
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
      });

      const me = await authService.getMe();
      syncUserFromManager(me);
      setAuthState({
        manager: me,
        user: {
          id: me.id,
          name: me.name,
          email: me.email ?? "",
          role: me.role,
        },
      });
      setFullName(me.fullName || me.name || "");
      setEmail(me.email ?? "");
      setPhone(me.phone ?? me.mobile ?? "");
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const profile: HubManager | null = manager;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hub Manager Profile"
        description="Details set up when this hub manager account was created"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-[#FF6B00] text-lg font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-gray-900">
                  {loading ? "Loading…" : profile?.fullName || profile?.name || "—"}
                </p>
                <p className="text-sm text-gray-500">
                  {(profile?.role || "HUB_MANAGER").replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <DetailRow
                icon={IdCard}
                label="Employee ID"
                value={profile?.employeeId || "—"}
              />
              <DetailRow
                icon={Building2}
                label="Assigned Hub"
                value={
                  profile?.hubName
                    ? `${profile.hubName}${profile.hubCode ? ` · ${profile.hubCode}` : ""}`
                    : profile?.hubCode || "—"
                }
              />
              <DetailRow
                icon={Shield}
                label="Warehouse"
                value={profile?.warehouseCode || "—"}
              />
              <DetailRow
                icon={UserRound}
                label="Last Login"
                value={formatLastLogin(profile?.lastLoginAt)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
            <p className="text-xs text-gray-500">
              Same fields captured during hub creation. Employee ID and role cannot
              be changed here.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="fullName"
                    className="pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || saving}
                    placeholder="Hub manager full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID / Username</Label>
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="employeeId"
                    className="pl-9 bg-gray-50"
                    value={profile?.employeeId || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  className="bg-gray-50"
                  value={profile?.role || "HUB_MANAGER"}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || saving}
                    placeholder="manager@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading || saving}
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hubCode">Hub Code</Label>
                <Input
                  id="hubCode"
                  className="bg-gray-50"
                  value={profile?.hubCode || "—"}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hubName">Hub Name</Label>
                <Input
                  id="hubName"
                  className="bg-gray-50"
                  value={profile?.hubName || "—"}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => void handleSave()}
                disabled={loading || saving}
                className="bg-[#FF6B00] hover:bg-[#E55F00]"
              >
                {saving ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
