import { useQuery } from "@tanstack/react-query";
import { Poll } from "@shared/schema";
import Layout from "@/components/layout/layout";
import PollCard from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: polls, isLoading, error } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
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

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">Error loading polls</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Poll Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your polls and view results</p>
        </div>
        <Button asChild>
          <Link href="/admin/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New Poll
          </Link>
        </Button>
      </div>
      
      {polls && polls.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No polls created yet</h3>
          <p className="mt-2 text-gray-600">Create your first poll to get started.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls?.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </Layout>
  );
}
