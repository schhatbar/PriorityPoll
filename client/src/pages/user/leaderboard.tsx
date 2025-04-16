import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Award, User, ArrowUp, Clock } from "lucide-react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPoints } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { toast } = useToast();
  
  const { data: topUsers, isLoading, error } = useQuery<UserPoints[]>({
    queryKey: ["/api/leaderboard"],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load leaderboard data",
      variant: "destructive",
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">
              Vote on polls to earn points and collect badges!
            </p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Top Users Card */}
          <Card className="col-span-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-2xl">
                <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Users with the most points from voting and participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topUsers && topUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Voter Name</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Badges</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.map((user, index) => (
                      <TableRow key={user.voterName}>
                        <TableCell className="font-medium">
                          {index === 0 ? (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">{index + 1}</Badge>
                          ) : index === 1 ? (
                            <Badge className="bg-gray-400 hover:bg-gray-500">{index + 1}</Badge>
                          ) : index === 2 ? (
                            <Badge className="bg-amber-700 hover:bg-amber-800">{index + 1}</Badge>
                          ) : (
                            <Badge variant="outline">{index + 1}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{user.voterName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="font-semibold">{user.points}</span>
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span>{user.badges?.length || 0}</span>
                            <Award className="h-4 w-4 text-purple-500" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/user-profile/${user.voterName}`}>View Profile</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No participants yet</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Be the first to vote in a poll and earn points!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How to Earn Points Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-500" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Vote in Polls</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Earn 10 points each time you submit a priority ranking in any active poll
                </p>
              </div>
              
              <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Regular Participation</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Get badges for voting in multiple polls and becoming an active contributor
                </p>
              </div>
              
              <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-medium">Collect Badges</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Earn special badges for achievements like being among the first voters or top contributors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}