import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, initLink } from "@/models/link";
import { BACKEND_URL } from "@/consts/config";
import { notify } from "@/lib/notify";
import axios from "axios";
import { AuthLoading } from "@/components/AuthLoading";
import Header from "@/components/Header";
import { OutlineButton } from "@/components/ui/outline-button";
import Footer from "@/components/Footer";
import { useUser } from "@/lib/store";
import { checkCredentials } from "@/lib/auth";
import React from "react";
import { getAxiosErrorMessage } from "@/lib/axios-error-handler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NewLinkPage() {
  const navigate = useNavigate();
  const currentUser = useUser();
  const [link, setLink] = useState<Partial<Link>>(initLink);
  const [date, setDate] = useState<Date>(addDays(new Date(), 364));

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
      notify.success("Link created successfully!");
      navigate("/");
    } catch (error: any) {
      notify.error(getAxiosErrorMessage(error));
    }
  };

  return (
    <>
      {currentUser.id == "" ? (
        <AuthLoading />
      ) : (
        <div className="flex flex-col justify-between">
          <Header />
          <div className="flex flex-col justify-start p-4 lg:p-32 lg:pt-16">
            <Card>
              <CardHeader>
                <CardTitle>Create New Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original_url">Target URL</Label>
                  <Input
                    id="original_url"
                    type="url"
                    placeholder="https://example.com"
                    value={link.original_url}
                    onChange={(e) =>
                      setLink({ ...link, original_url: e.target.value })
                    }
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
                      <AvatarImage src={currentUser.avatar_url} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start justify-center">
                      <div>
                        {currentUser.first_name} {currentUser.last_name}
                      </div>
                      <div className="text-gray-400">{currentUser.email}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-background p-0">
                      <div className="flex justify-between">
                        <div className="w-full p-2">
                          <Select
                            value={date ? date.getFullYear().toString() : ""}
                            onValueChange={(value) => {
                              const newDate = new Date(date || new Date());
                              newDate.setFullYear(parseInt(value));
                              setDate(newDate);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full p-2">
                          <Select
                            value={date ? (date.getMonth() + 1).toString() : ""}
                            onValueChange={(value) => {
                              const newDate = new Date(date || new Date());
                              newDate.setMonth(parseInt(value) - 1);
                              setDate(newDate);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                return (
                                  <SelectItem
                                    key={month}
                                    value={month.toString()}
                                  >
                                    {new Date(0, i).toLocaleString("default", {
                                      month: "long",
                                    })}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(value) => {
                          if (value) {
                            setDate(value);
                          } else {
                            setDate(addDays(new Date(), 364));
                          }
                        }}
                        month={date || new Date()}
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
                      Cancel
                    </Button>
                    <OutlineButton
                      onClick={() => {
                        createLink();
                      }}
                    >
                      Create Link
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
