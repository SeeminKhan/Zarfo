"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Briefcase, Mail, Home, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (!user) return <div className="text-center py-12">No user found.</div>;

  // Role-specific stats
  const roleStats = {
    worker: [
      { icon: <Briefcase className="w-5 h-5 text-[var(--green-primary)]" />, label: "Deliveries", value: user.deliveries || 0 },
      { icon: <Star className="w-5 h-5 text-yellow-400" />, label: "Rating", value: user.rating || "—" },
    ],
    robin: [
      { icon: <Briefcase className="w-5 h-5 text-[var(--green-primary)]" />, label: "Assigned Orders", value: user.deliveries || 0 },
      { icon: <Star className="w-5 h-5 text-yellow-400" />, label: "Rating", value: user.rating || "—" },
    ],
    hotel: [
      { icon: <MapPin className="w-5 h-5 text-[var(--green-primary)]" />, label: "Location", value: `${user.address?.suburb || ""}, ${user.address?.city || ""}` },
      { icon: <Users className="w-5 h-5 text-[var(--green-primary)]" />, label: "Total Meals Donated", value: user.mealsDonated || 0 },
    ],
    user: [
      { icon: <Home className="w-5 h-5 text-[var(--green-primary)]" />, label: "Address", value: `${user.address?.houseNo || ""}, ${user.address?.suburb || ""}, ${user.address?.city || ""}` },
      { icon: <Users className="w-5 h-5 text-[var(--green-primary)]" />, label: "Community Rank", value: user.rank || "—" },
    ],
    admin: [
      { icon: <Users className="w-5 h-5 text-[var(--green-primary)]" />, label: "Total Users", value: user.totalUsers || 0 },
      { icon: <Briefcase className="w-5 h-5 text-[var(--green-primary)]" />, label: "Managed Roles", value: "All" },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[var(--green-light)]/20 pb-6">
        <div className="w-24 h-24 rounded-full bg-[var(--green-primary)] flex items-center justify-center text-white text-3xl font-bold">
          {user.name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[var(--green-primary)]">{user.name}</h2>
          <p className="text-sm text-[var(--muted-text)] capitalize">{user.role}</p>
          <p className="text-sm text-[var(--muted-text)]">{user.email}</p>
        </div>
      </div>

      {/* Role Stats */}
      <Card className="bg-[var(--card-bg)] shadow-md">
        <CardHeader>
          <CardTitle className="text-[var(--green-primary)]">Profile Stats</CardTitle>
          <CardDescription>Your role-specific information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleStats[user.role]?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[var(--bg-color-light)] p-4 rounded-lg">
              {item.icon}
              <div>
                <p className="text-sm text-[var(--muted-text)]">{item.label}</p>
                <p className="font-medium text-[var(--text-color)]">{item.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Address / Contact */}
      <Card className="bg-[var(--card-bg)] shadow-md">
        <CardHeader>
          <CardTitle className="text-[var(--green-primary)]">Contact & Address</CardTitle>
          <CardDescription>Your location and email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.address && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[var(--green-primary)]" />
              <p className="text-[var(--text-color)]">
                {user.address.houseNo}, {user.address.suburb}, {user.address.city}, {user.address.state}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[var(--green-primary)]" />
            <p className="text-[var(--text-color)]">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          className="bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
