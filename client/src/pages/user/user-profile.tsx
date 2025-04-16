import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Award, User, CheckCircle, MedalIcon, StarIcon } from "lucide-react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserPoints, Vote, Poll } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfile() {
  const { name } = useParams<{ name: string }>();
  const { toast } = useToast();
  
  const { data: userPoints, isLoading: isLoadingUser, error: userError } = useQuery<UserPoints>({
    queryKey: ["/api/user-points", name],
    enabled: !!name,
  });

  const { data: userVotes, isLoading: isLoadingVotes, error: votesError } = useQuery<Vote[]>({
    queryKey: ["/api/user-votes", name],
    enabled: !!name,
  });

  if (userError || votesError) {
    toast({
      title: "Error",
      description: "Failed to load user profile data",
      variant: "destructive",
    });
  }

  const isLoading = isLoadingUser || isLoadingVotes;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const levelInfo = {
    1: { name: "Beginner", threshold: 0, color: "bg-gray-200", next: 50 },
    2: { name: "Regular Voter", threshold: 50, color: "bg-blue-200", next: 100 },
    3: { name: "Active Contributor", threshold: 100, color: "bg-green-200", next: 200 },
    4: { name: "Voting Expert", threshold: 200, color: "bg-purple-200", next: 500 },
    5: { name: "Poll Master", threshold: 500, color: "bg-amber-200", next: 1000 },
    6: { name: "Priority Legend", threshold: 1000, color: "bg-red-200", next: null },
  };

  const getUserLevel = (points: number) => {
    const levels = Object.entries(levelInfo).map(([level, info]) => ({
      level: parseInt(level),
      ...info,
    }));
    
    const userLevel = levels
      .filter(level => points >= level.threshold)
      .sort((a, b) => b.level - a.level)[0];
      
    return userLevel;
  };

  const getProgressToNextLevel = (points: number, currentLevel: any) => {
    if (!currentLevel.next) return 100; // Max level
    
    const progress = ((points - currentLevel.threshold) / 
      (currentLevel.next - currentLevel.threshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leaderboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Leaderboard
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Skeleton className="h-40 col-span-full" />
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
            </div>
          </div>
        ) : userPoints ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(userPoints.voterName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{userPoints.voterName}</h1>
                  <p className="text-muted-foreground">Joined {new Date(userPoints.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold">{userPoints.points} points</span>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            {userPoints.points !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Award className="mr-2 h-5 w-5 text-purple-500" />
                    Voter Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentLevel = getUserLevel(userPoints.points);
                    const progress = getProgressToNextLevel(userPoints.points, currentLevel);
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className={`${currentLevel.color} text-gray-800 mr-2`}>
                              Level {currentLevel.level}
                            </Badge>
                            <span className="font-medium">{currentLevel.name}</span>
                          </div>
                          
                          {currentLevel.next ? (
                            <span className="text-sm text-gray-500">
                              {userPoints.points} / {currentLevel.next} points
                            </span>
                          ) : (
                            <Badge variant="secondary">Max Level</Badge>
                          )}
                        </div>
                        
                        <Progress value={progress} className="h-2" />
                        
                        {currentLevel.next && (
                          <p className="text-sm text-gray-500">
                            {currentLevel.next - userPoints.points} more points until Level {currentLevel.level + 1}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Badges Card */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <MedalIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    Badges Earned
                  </CardTitle>
                  <CardDescription>
                    Special achievements unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userPoints.badges && userPoints.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {userPoints.badges.map((badge, index) => (
                        <div key={index} className="flex flex-col p-3 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div 
                              className="p-2 rounded-full text-xl"
                              dangerouslySetInnerHTML={{ __html: badge.icon }}
                            />
                            <Badge variant="outline" className="text-xs">
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                          <h3 className="font-medium mt-2">{badge.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-40">
                      <Award className="h-10 w-10 text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">No badges yet</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Continue voting in polls to earn badges!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participation History */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Poll Participation
                  </CardTitle>
                  <CardDescription>
                    Polls this user has voted in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userVotes && userVotes.length > 0 ? (
                    <div className="space-y-4">
                      {userVotes.map((vote) => (
                        <div key={vote.id} className="flex justify-between border-b pb-3 last:border-0">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <StarIcon className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">
                                Poll #{vote.pollId}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Voted on {new Date(vote.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="h-fit">
                            {vote.rankings.length} options ranked
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-40">
                      <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">No votes yet</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        This user hasn't participated in any polls
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't find a user with the name "{name}"
            </p>
            <Button asChild>
              <Link href="/leaderboard">
                Return to Leaderboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}