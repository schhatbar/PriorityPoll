import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PollOption } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  options: z.array(
    z.object({
      text: z.string().min(1, "Option text is required"),
    })
  ).min(2, "At least 2 options are required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePoll() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ text: "" }, { text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert options to the format expected by the API
      const options: PollOption[] = data.options.map((option, index) => ({
        id: index + 1,
        text: option.text,
      }));

      const payload = {
        title: data.title,
        description: data.description || "",
        options,
      };

      const res = await apiRequest("POST", "/api/polls", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Poll created",
        description: "Your poll has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      setLocation("/admin");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create poll: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createPollMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation("/admin");
  };

  const addOption = () => {
    append({ text: "" });
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    } else {
      toast({
        title: "Error",
        description: "A poll must have at least 2 options.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Create New Poll</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poll Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter poll title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide additional context for the poll" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Poll Options</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Add at least 2 options for users to rank in order of priority.
                </p>
                {form.formState.errors.options?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.options.message}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPollMutation.isPending}
                >
                  {createPollMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Poll"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}
