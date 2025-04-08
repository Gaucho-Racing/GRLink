import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, initLink } from "@/models/link";
import { BACKEND_URL } from "@/consts/config";
import { notify } from "@/lib/notify";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/store";
import { OutlineButton } from "@/components/ui/outline-button";
import { AuthLoading } from "@/components/AuthLoading";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAxiosErrorMessage } from "@/lib/axios-error-handler";
import { checkCredentials } from "@/lib/auth";
import React from "react";

export default function EditLinkPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useUser();
  const [link, setLink] = useState<Partial<Link>>(initLink);
  const [date, setDate] = useState<Date>(addDays(new Date(), 364));

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/links/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sentinel_access_token")}`,
          },
        });
        const linkData = response.data;
        setLink(linkData);
        if (linkData.expires_at) {
          setDate(new Date(linkData.expires_at));
        }
      } catch (error: any) {
        notify.error(error.response?.data?.message || "Failed to fetch link");
        navigate("/");
      }
    };

    fetchLink();
  }, [id, navigate]);

  React.useEffect(() => {
    checkAuth().then(() => {});
  }, []);

  const checkAuth = async () => {
    const currentRoute = window.location.pathname + window.location.search;
    const status = await checkCredentials();
    if (status != 0) {
      if (currentRoute == "/") {
        navigate(`/auth/login`);
      } else {
        navigate(`/auth/login?route=${encodeURIComponent(currentRoute)}`);
      }
    }
  };

  const createLink = async () => {
    link.expires_at = date;
    link.user_id = currentUser.id;
    try {
      await axios.post(`${BACKEND_URL}/links`, link, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sentinel_access_token")}`,
        },
      });
      notify.success("Link updated successfully!");
      navigate("/");
    } catch (error: any) {
      notify.error(getAxiosErrorMessage(error));
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <>
      {currentUser.id == "" || link.id == "" ? (
        <AuthLoading />
      ) : (
        <div className="flex flex-col justify-between">
          <Header />
          <div className="flex flex-col justify-start p-4 lg:p-32 lg:pt-16">
            <Card>
              <CardHeader>
                <CardTitle>Edit Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original_url">Original URL</Label>
                  <Input
                    id="original_url"
                    type="url"
                    placeholder="https://example.com"
                    value={link.original_url}
                    onChange={(e) =>
                      setLink({ ...link, original_url: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_code">
                    Custom Short URL (Optional)
                  </Label>
                  <Input
                    id="short_code"
                    placeholder="my-custom-link"
                    value={link.short_code}
                    onChange={(e) =>
                      setLink({ ...link, short_code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_code">Created By</Label>
                  <div className="mt-2 flex items-center">
                    <Avatar className="mr-4">
                      <AvatarImage src={link.user?.avatar_url} />
                      <AvatarFallback>
                        {link.user?.first_name?.[0]}
                        {link.user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start justify-center">
                      <div>
                        {link.user?.first_name} {link.user?.last_name}
                      </div>
                      <div className="text-gray-400">{link.user?.email}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    id="is_active"
                    checked={link.is_active}
                    onCheckedChange={(checked) =>
                      setLink({ ...link, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex w-full items-center justify-end">
                  <div className="flex items-center justify-end">
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        navigate("/");
                      }}
                      className="mr-2 py-5"
                    >
                      Discard Changes
                    </Button>
                    <OutlineButton
                      onClick={() => {
                        createLink();
                      }}
                    >
                      Save Changes
                    </OutlineButton>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}
