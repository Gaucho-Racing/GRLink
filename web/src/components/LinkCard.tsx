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
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  ExternalLink,
  BarChart2,
  Clock,
  Edit2,
  Check,
} from "lucide-react";
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

  const handleCopy = () => {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(link);
  };

  const handleEdit = () => {
    navigate(`/links/${link.id}/edit`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            {link.short_code}
          </CardTitle>
          <CardDescription className="max-w-[300px] truncate text-lg text-gr-pink">
            {link.original_url}
          </CardDescription>
        </div>
        <Badge variant={link.is_active ? "default" : "secondary"}>
          {link.is_active ? "Active" : "Inactive"}
        </Badge>
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
      <CardFooter className="flex justify-between">
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
            onClick={() =>
              window.open(`${BACKEND_URL}/${link.short_code}`, "_blank")
            }
            className="flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="flex items-center"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
