"use client";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuthStore();

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={user?.role} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">
                  Get notified when inventory falls below threshold
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#FF6B00]" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dispatch Updates</p>
                <p className="text-xs text-gray-500">
                  Receive updates on dispatch status changes
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#FF6B00]" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Requisition Approvals</p>
                <p className="text-xs text-gray-500">
                  Notifications for pending requisition approvals
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#FF6B00]" />
            </div>
          </CardContent>
        </Card>
        <Button onClick={handleSave} className="w-fit">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
