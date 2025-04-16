import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Medal, Award, Star, ChevronRight, Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserPoints } from "@shared/schema";

export default function Leaderboard() {
  const [_, setLocation] = useLocation();

  const { data: topUsers, isLoading, error } = useQuery<UserPoints[]>({
    queryKey: ["/api/leaderboard"],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !topUsers) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">
            {error ? `Error: ${error.message}` : "Failed to load leaderboard"}
          </h2>
          <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  // Get top 3 users for special highlighting
  const topThreeUsers = topUsers.slice(0, 3);
  const otherUsers = topUsers.slice(3);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <Badge variant="outline" className="bg-primary/5 gap-1">
            <Users className="h-3.5 w-3.5" />
            {topUsers.length} participants
          </Badge>
        </div>

        <p className="text-gray-500 mb-8">
          See who's leading in our polls by participating and earning points!
        </p>

        {/* Top 3 Users Podium */}
        {topThreeUsers.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" /> Top Contributors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThreeUsers.map((user, index) => {
                // Determine appropriate icon and colors based on rank
                let RankIcon = Trophy;
                let badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                let rankText = "1st Place";
                
                if (index === 1) {
                  RankIcon = Medal;
                  badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
                  rankText = "2nd Place";
                } else if (index === 2) {
                  RankIcon = Award;
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                  rankText = "3rd Place";
                }

                // Get user initials for avatar
                const initials = user.voterName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <Card key={user.id} className={`overflow-hidden ${index === 0 ? 'border-amber-200 shadow-md' : ''}`}>
                    <div className={`h-3 ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-200'}`}></div>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className={`h-14 w-14 ${index === 0 ? 'border-2 border-amber-400' : ''}`}>
                        <AvatarFallback className={`${index === 0 ? 'bg-amber-50 text-amber-700' : 'bg-primary/5 text-primary/80'} text-lg font-bold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{user.voterName}</CardTitle>
                        <Badge className={`mt-1 ${badgeColor}`}>
                          <RankIcon className="h-3 w-3 mr-1" />
                          {rankText}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-primary/5 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Points</p>
                          <p className="text-2xl font-bold text-primary">{user.points}</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Level</p>
                          <p className="text-2xl font-bold text-primary">{user.level}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Polls Voted</span>
                          <span className="font-medium">{user.votesCount}</span>
                        </div>
                        
                        {user.badges && (user.badges as any[]).length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">Achievements</p>
                            <div className="flex flex-wrap gap-2">
                              {(user.badges as any[]).slice(0, 3).map((badge, badgeIndex) => (
                                <Badge key={badgeIndex} variant="outline" className="bg-primary/5">
                                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                                  {badge.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Users */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Participants</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/5 text-primary">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary/80">
                          {user.voterName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.voterName}</p>
                        <p className="text-xs text-gray-500">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-primary">{user.points}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/user-profile/${user.voterName}`)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}