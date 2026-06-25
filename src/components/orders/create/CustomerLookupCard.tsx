"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  ExternalLink,
  Phone,
  Search,
  User,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNumberInput } from "@/components/ui/MobileNumberInput";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCreateOrderStore } from "@/store/createOrderStore";
import { CUSTOMER_TYPE_OPTIONS } from "@/mock/createOrderData";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function CustomerLookupCard() {
  const {
    mobileSearch,
    setMobileSearch,
    searchCustomer,
    isSearching,
    customer,
    showRegistration,
    isNewCustomer,
    newCustomer,
    setNewCustomerField,
    createNewCustomer,
    showQuickRegistration,
  } = useCreateOrderStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCustomer();
  };

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <User className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#111827]">
            Customer Information
          </CardTitle>
        </div>
        {customer && !isNewCustomer && (
          <Badge className="bg-orange-50 text-[#FF6B00] hover:bg-orange-50">
            Existing Customer
          </Badge>
        )}
        {isNewCustomer && customer && (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
            New Registration
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <MobileNumberInput
            value={mobileSearch}
            onChange={setMobileSearch}
            leadingIcon={<Phone className="h-4 w-4" />}
            size="lg"
            className="flex-1 border-[#E5E7EB] text-base"
          />
          <Button
            type="submit"
            disabled={isSearching}
            className="h-12 rounded-xl bg-[#1E293B] px-6 hover:bg-[#0F172A]"
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Search Customer"}
          </Button>
        </form>

        {customer && !showRegistration && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-[#3B82F6] text-lg font-bold text-white">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-[#111827]">
                      {customer.name}
                    </h3>
                    {customer.gstStatus === "verified" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <BadgeCheck className="mr-1 h-3 w-3" />
                        GST VERIFIED
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {customer.customerTypeLabel}
                    {customer.company && ` • ${customer.company}`}
                  </p>
                  {customer.gstNumber && (
                    <p className="mt-1 text-xs text-gray-500">
                      GST: {customer.gstNumber}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {customer.email} • {customer.mobile}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Lifetime Revenue
                </p>
                <p className="text-2xl font-bold text-[#FF6B00]">
                  {formatCurrency(customer.lifetimeRevenue)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {customer.previousOrders} orders • Since {customer.customerSince}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-blue-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => toast("Opening customer profile (mock).")}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View Customer Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => toast("Opening order history (mock).")}
              >
                View Previous Orders
              </Button>
            </div>
          </motion.div>
        )}

        {showRegistration && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#FF6B00]" />
              <h3 className="font-semibold text-[#111827]">Customer Not Found</h3>
              <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]">
                Quick Registration
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter full name"
                  value={newCustomer.fullName}
                  onChange={(e) =>
                    setNewCustomerField("fullName", e.target.value)
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <MobileNumberInput
                  value={newCustomer.mobile}
                  onChange={(digits) => setNewCustomerField("mobile", digits)}
                  size="lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomerField("email", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select
                  value={newCustomer.customerType}
                  onValueChange={(v) =>
                    setNewCustomerField(
                      "customerType",
                      v as typeof newCustomer.customerType
                    )
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="button"
              onClick={createNewCustomer}
              className="mt-4 rounded-xl"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create New Customer
            </Button>
          </motion.div>
        )}

        {!customer && !showRegistration && (
          <button
            type="button"
            onClick={showQuickRegistration}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium text-[#FF6B00] hover:underline"
            )}
          >
            <UserPlus className="h-4 w-4" />
            New User? Quick Registration
          </button>
        )}
      </CardContent>
    </Card>
  );
}
