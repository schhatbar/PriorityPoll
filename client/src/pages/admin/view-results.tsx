import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Poll, Vote, PollOption, PollRanking } from "@shared/schema";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Clock, User, Award, Trophy, Medal, List, Calendar, CheckCircle, CheckCircle2, Users, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ViewResults() {
  const { id } = useParams<{ id: string }>();
  const pollId = parseInt(id);
  const [_, setLocation] = useLocation();

  const { data: poll, isLoading: isPollLoading, error: pollError } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
  });

  const { data: votes, isLoading: isVotesLoading, error: votesError } = useQuery<Vote[]>({
    queryKey: [`/api/polls/${pollId}/votes`],
    enabled: !!poll,
  });

  const isLoading = isPollLoading || isVotesLoading;
  const error = pollError || votesError;

  const handleBack = () => {
    setLocation("/admin");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !poll) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">
            {error ? `Error: ${error?.message}` : "Poll not found"}
          </h2>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  // Format data for the chart
  const chartData = poll.results ? Object.entries(poll.results).map(([option, points]) => ({
    name: option,
    points: points,
  })) : [];

  // Sort data by points (descending)
  if (chartData.length > 0) {
    chartData.sort((a, b) => b.points - a.points);
  }
  
  // Get poll options
  const pollOptions = poll.options as PollOption[];

  // Helper function to get option text by ID
  const getOptionTextById = (optionId: number) => {
    const option = pollOptions.find(opt => opt.id === optionId);
    return option ? option.text : 'Unknown option';
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Poll Results</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="individual">Individual Votes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Ranking Results</h3>
              
              {chartData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">No votes have been recorded for this poll yet.</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={150}
                          tickFormatter={(value) => 
                            value.length > 20 ? value.substring(0, 20) + '...' : value
                          }
                        />
                        <Tooltip />
                        <Bar dataKey="points" fill="#3B82F6" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-48 mr-4 text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ 
                              width: `${Math.max(5, (item.points / Math.max(...chartData.map(d => d.points))) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-700">{item.points} points</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Last updated: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="individual">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary/70" />
                  <h3 className="font-medium text-gray-800">Individual Voter Data</h3>
                </div>
                <Badge variant="outline" className="bg-primary/5">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  {votes?.length || 0} voters
                </Badge>
              </div>
              
              <Separator className="my-4" />
              
              {!votes || votes.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 text-gray-300" />
                    <h3 className="text-base font-medium text-gray-500">No votes yet</h3>
                    <p className="text-gray-400 text-sm">No votes have been recorded for this poll.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  {votes.map((vote) => {
                    const rankings = vote.rankings as PollRanking[];
                    // Sort by rank (ascending)
                    const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
                    
                    // Get initials for avatar
                    const initials = vote.voterName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);
                      
                    // Get top 3 choices
                    const topChoices = sortedRankings.slice(0, 3);
                    
                    return (
                      <Card key={vote.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-primary/10 bg-primary/5">
                                <AvatarFallback className="bg-primary/10 text-primary/80 font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{vote.voterName}</CardTitle>
                                <CardDescription className="text-xs">
                                  Voted {new Date(vote.id * 1000).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-100"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="px-6 py-3 bg-gray-50 border-y border-gray-100">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <h4 className="text-sm font-medium text-gray-700">Priority Ranking</h4>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <Table>
                              <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                  <TableHead className="w-20">Rank</TableHead>
                                  <TableHead>Option</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedRankings.map((ranking, idx) => (
                                  <TableRow key={idx} className={idx < 3 ? "bg-primary/[.03]" : ""}>
                                    <TableCell className="py-2">
                                      {idx === 0 && (
                                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
                                          <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                                          1st
                                        </Badge>
                                      )}
                                      {idx === 1 && (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                          2nd
                                        </Badge>
                                      )}
                                      {idx === 2 && (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                          3rd
                                        </Badge>
                                      )}
                                      {idx > 2 && (
                                        <span className="text-xs text-gray-500 font-medium ml-1">
                                          {ranking.rank}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className={cn(
                                      "py-2 text-sm",
                                      idx < 3 ? "font-medium" : "text-gray-700"
                                    )}>
                                      {getOptionTextById(ranking.optionId)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between items-center py-3 bg-gray-50/50 border-t border-gray-100">
                          <div className="text-xs text-gray-500 flex items-center">
                            <List className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {sortedRankings.length} options ranked
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}
