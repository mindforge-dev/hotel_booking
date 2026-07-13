"use client";

import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/user/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Loader2,
  Badge,
  Save,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ name, email });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Name section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.image || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {profile?.name || "No name set"}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {profile?.role || "USER"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Edit form */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.name || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.email || "Not set"}</span>
                </div>
              </div>
              <Button variant="outline" onClick={startEditing}>
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <p className="text-2xl font-bold">
                {profile?._count?.bookings || 0}
              </p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <p className="text-2xl font-bold">
                {profile?._count?.favorites || 0}
              </p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <p className="text-2xl font-bold">
                {profile?.loyaltyPoints || 0}
              </p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
