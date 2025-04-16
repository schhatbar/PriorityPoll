import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Trophy, Medal, Award, Star, ChevronLeft, User, Calendar, Activity, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { UserPoints } from "@shared/schema";

export default function UserProfile() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const [_, setLocation] = useLocation();

  const { data: userProfile, isLoading, error } = useQuery<UserPoints>({
    queryKey: [`/api/user-profile/${decodedName}`],
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

  if (error || !userProfile) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">
            {error ? `Error: ${error.message}` : `User profile for "${decodedName}" not found`}
          </h2>
          <p className="text-gray-500 mt-2 mb-4">
            This user may not have participated in any polls yet.
          </p>
          <Button variant="outline" className="mt-2" onClick={() => setLocation("/leaderboard")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Format dates
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate progress to next level
  const pointsToNextLevel = 100; // Points needed per level
  const currentLevelPoints = (userProfile.level - 1) * pointsToNextLevel;
  const pointsInCurrentLevel = userProfile.points - currentLevelPoints;
  const progressToNextLevel = Math.min(Math.round((pointsInCurrentLevel / pointsToNextLevel) * 100), 100);

  // Get user initials for avatar
  const initials = userProfile.voterName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Get achievements and badges
  const achievements = userProfile.achievements as string[] || [];
  const badges = userProfile.badges as any[] || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={() => setLocation("/leaderboard")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Leaderboard
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary/10">
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{userProfile.voterName}</CardTitle>
                <CardDescription>
                  Member since {formatDate(userProfile.firstVoteDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="text-2xl font-bold text-primary">{userProfile.level}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="text-2xl font-bold text-primary">{userProfile.points}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progress to Level {userProfile.level + 1}</span>
                      <span>{pointsInCurrentLevel}/{pointsToNextLevel}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-500 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      Polls Voted
                    </span>
                    <span className="font-medium">{userProfile.votesCount}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Last Vote
                    </span>
                    <span className="font-medium">{formatDate(userProfile.lastVoteDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Achievements and Badges */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                  <CardTitle>Achievements</CardTitle>
                </div>
                <CardDescription>
                  Achievements earned through participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No achievements yet</p>
                    <p className="text-sm text-gray-400">Continue participating to earn achievements</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-3 bg-primary/5 rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement}</p>
                          <p className="text-xs text-gray-500">Earned by participation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Medal className="h-5 w-5 text-amber-500 mr-2" />
                  <CardTitle>Badges</CardTitle>
                </div>
                <CardDescription>
                  Special badges and awards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Medal className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No badges yet</p>
                    <p className="text-sm text-gray-400">Complete special actions to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {badges.map((badge, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mr-4 flex-shrink-0">
                          {badge.icon === 'trophy' && <Trophy className="h-6 w-6 text-amber-500" />}
                          {badge.icon === 'star' && <Star className="h-6 w-6 text-amber-500" />}
                          {badge.icon === 'award' && <Award className="h-6 w-6 text-amber-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{badge.name}</p>
                          <p className="text-sm text-gray-500">{badge.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Earned on {formatDate(badge.earnedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}