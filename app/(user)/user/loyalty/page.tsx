"use client";

import { useLoyalty } from "@/hooks/user/useLoyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Trophy,
  Gift,
  Loader2,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  Silver: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
  Gold: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  Platinum: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
};

const sourceLabels: Record<string, string> = {
  BOOKING: "🏨 Booking",
  REVIEW: "⭐ Review",
  PROMO: "🎁 Promo",
  REFERRAL: "🤝 Referral",
};

export default function LoyaltyPage() {
  const { data, isLoading } = useLoyalty();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPoints = data?.totalPoints || 0;
  const tier = data?.tier || "Bronze";
  const nextTier = data?.nextTier;
  const nextTierPoints = data?.nextTierPoints || 1000;
  const progress = nextTier ? Math.min((totalPoints / nextTierPoints) * 100, 100) : 100;
  const tierColor = tierColors[tier] || tierColors.Bronze;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Loyalty & Rewards</h1>
        <p className="text-muted-foreground">Track your membership tier and points</p>
      </div>

      {/* Points & Tier Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
            </div>
            <Badge
              className={`${tierColor.bg} ${tierColor.text} border ${tierColor.border} px-3 py-1 text-sm`}
            >
              <Trophy className="h-3.5 w-3.5 mr-1" />
              {tier} Member
            </Badge>
          </div>

          {nextTier && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to {nextTier}</span>
                <span className="font-medium">{totalPoints.toLocaleString()} / {nextTierPoints.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextTierPoints - totalPoints} points to go
              </p>
            </div>
          )}

          {!nextTier && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-sm font-medium">You&apos;ve reached the highest tier!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Complete a Booking", points: 100, icon: "🏨" },
              { label: "Write a Review", points: 25, icon: "⭐" },
              { label: "Refer a Friend", points: 200, icon: "🤝" },
              { label: "Promotional Bonus", points: "Varies", icon: "🎁" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">+{item.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Points History</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.history && data.history.length > 0 ? (
            <div className="space-y-0 divide-y">
              {data.history.map((point) => (
                <div key={point.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{point.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {sourceLabels[point.source] || point.source} •{" "}
                        {new Date(point.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+{point.points}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No points history yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete a booking to start earning points
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
