import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Copy, Mail, Link as LinkIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface SharePollProps {
  pollId: number;
  pollTitle: string;
}

export default function SharePoll({ pollId, pollTitle }: SharePollProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate the poll URL
  const pollUrl = `${window.location.origin}/polls/${pollId}`;
  
  // Email subject and body
  const emailSubject = encodeURIComponent(`Join the "${pollTitle}" poll`);
  const emailBody = encodeURIComponent(
    `Hi there,\n\nI'd like to invite you to participate in the "${pollTitle}" poll.\n\nYou can access it here: ${pollUrl}\n\nThanks!`
  );
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(pollUrl).then(() => {
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Poll link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm">
          <Share className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-72 p-3 sm:p-4">
        <h3 className="font-medium text-sm sm:text-base mb-2">Share this poll</h3>
        <div className="flex mb-3 sm:mb-4">
          <Input 
            value={pollUrl} 
            readOnly 
            className="rounded-r-none text-xs sm:text-sm h-8 sm:h-10"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={copyToClipboard}
                  variant="default"
                  className="rounded-l-none h-8 sm:h-10 px-2 sm:px-3"
                >
                  {copied ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs sm:text-sm">Copy to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
            onClick={() => {
              window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, "_blank");
            }}
          >
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Email
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(`Join the "${pollTitle}" poll: ${pollUrl}`)}`, "_blank");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
            </svg>
            <span className="hidden xs:inline">WhatsApp</span>
            <span className="xs:hidden">WA</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}