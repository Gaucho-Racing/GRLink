import { Link } from "@/models/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, BarChart2, Clock, Check } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { BACKEND_URL } from "@/consts/config";
import { useNavigate } from "react-router-dom";

interface LinkCardProps {
  link: Link;
  onEdit?: (link: Link) => void;
  onCopy?: (link: Link) => void;
}

export function LinkCard({ link, onCopy }: LinkCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(link);
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`${BACKEND_URL}/${link.short_code}`, "_blank");
  };

  const handleCardClick = () => {
    navigate(`/links/${link.id}`);
  };

  const getStatusStyle = () => {
    const now = new Date();
    const expiresAt = new Date(link.expires_at);

    if (now > expiresAt) {
      return "bg-red-400 text-white";
    }

    if (!link.is_active) {
      return "bg-neutral-800 text-white";
    }

    return "bg-gradient-to-br from-gr-pink to-gr-purple text-white";
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <div className="flex w-full items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {link.short_code}
            </CardTitle>
            <div
              className={`ml-2 rounded-md px-2 py-1 text-xs font-medium ${getStatusStyle()}`}
            >
              {new Date() > new Date(link.expires_at)
                ? "Expired"
                : link.is_active
                  ? "Active"
                  : "Inactive"}
            </div>
          </div>
          <CardDescription className="max-w-[300px] truncate text-lg text-gr-pink">
            {link.original_url}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BarChart2 className="mr-1 h-4 w-4" />
            {link.statistics.total_visits} visits
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {formatDistanceToNow(new Date(link.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVisit}
            className="flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
