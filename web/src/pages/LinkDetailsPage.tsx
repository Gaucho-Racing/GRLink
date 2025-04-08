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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { Link, initLink } from "@/models/link";
import { BACKEND_URL } from "@/consts/config";
import { notify } from "@/lib/notify";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/store";
import { AuthLoading } from "@/components/AuthLoading";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAxiosErrorMessage } from "@/lib/axios-error-handler";
import { checkCredentials } from "@/lib/auth";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { QRCode } from "react-qrcode-logo";

export default function LinkDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useUser();
  const [link, setLink] = useState<Partial<Link>>(initLink);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrCodeRef, setQrCodeRef] = useState<HTMLDivElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const handleCopy = () => {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisit = () => {
    window.open(`${BACKEND_URL}/${link.short_code}`, "_blank");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/links/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sentinel_access_token")}`,
        },
      });
      notify.success("Link deleted successfully!");
      navigate("/");
    } catch (error: any) {
      notify.error(getAxiosErrorMessage(error));
      setIsDeleting(false);
    }
  };

  const canEdit = () => {
    return (
      currentUser.id === link.user_id ||
      currentUser.roles.includes("d_admin") ||
      currentUser.roles.includes("d_officer") ||
      currentUser.roles.includes("d_lead")
    );
  };

  const getStatusStyle = () => {
    const now = new Date();
    const expiresAt = new Date(link.expires_at || "");

    if (now > expiresAt) {
      return "bg-red-400 text-white";
    }

    if (!link.is_active) {
      return "bg-neutral-800 text-white";
    }

    return "bg-gradient-to-br from-gr-pink to-gr-purple text-white";
  };

  const handleDownloadQR = () => {
    if (qrCodeRef) {
      const canvas = qrCodeRef.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `${link.short_code}-qr.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  return (
    <>
      {currentUser.id == "" || link.id == "" ? (
        <AuthLoading />
      ) : (
        <div className="flex flex-col justify-between">
          <Header />
          <div className="flex flex-col justify-start p-4 lg:p-32 lg:pt-8">
            <div className="mb-4">
              <Button
                variant={"ghost"}
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4 text-gray-400" />
                Back to home
              </Button>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Link Details</CardTitle>
                  <div
                    className={`rounded-md px-4 py-2 text-sm font-medium ${getStatusStyle()}`}
                  >
                    {new Date() > new Date(link.expires_at || "")
                      ? "Expired"
                      : link.is_active
                        ? "Active"
                        : "Inactive"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Short URL</h3>
                      <div className="flex items-center space-x-2">
                        <p className="mr-2 text-xl font-semibold text-gr-pink">
                          {link.short_code}
                        </p>
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Target URL</h3>
                      <div className="flex items-center space-x-2">
                        <p className="mr-2 max-w-[600px] truncate text-lg text-gr-pink">
                          {link.original_url}
                        </p>
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
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Created By</h3>
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
                          <div className="text-gray-400">
                            {link.user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Created At</h3>
                      <div className="text-md flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-5 w-5" />
                        {format(
                          new Date(link.created_at || ""),
                          "MMMM d, yyyy 'at' h:mm a",
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Expiration</h3>
                      <div className="text-md flex items-center text-muted-foreground">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {link.expires_at
                          ? format(new Date(link.expires_at), "MMMM d, yyyy")
                          : "No expiration date"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-start">
                    <Card className="h-full border border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">QR Code</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="qr-mode" className="text-sm">
                              {isDarkMode ? (
                                <Moon className="h-4 w-4" />
                              ) : (
                                <Sun className="h-4 w-4" />
                              )}
                            </Label>
                            <Switch
                              id="qr-mode"
                              checked={isDarkMode}
                              onCheckedChange={setIsDarkMode}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center space-y-4">
                        <div
                          ref={setQrCodeRef}
                          className={`rounded-md p-4 ${
                            isDarkMode ? "bg-black" : "bg-white"
                          }`}
                        >
                          <QRCode
                            value={`${window.location.origin}/${link.short_code}`}
                            size={200}
                            qrStyle="squares"
                            bgColor={isDarkMode ? "#000000" : "#ffffff"}
                            fgColor={isDarkMode ? "#ffffff" : "#000000"}
                            eyeRadius={5}
                            logoImage="/logo/gr-logo-blank.png"
                            logoPaddingStyle="circle"
                            logoPadding={2}
                            logoWidth={50}
                            logoHeight={50}
                            logoOpacity={1}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadQR}
                          className="flex items-center"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download QR Code
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex w-full items-center justify-end">
                  <div className="flex items-center justify-end space-x-2">
                    {canEdit() && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/links/${link.id}/edit`)}
                          className="flex items-center py-5"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Link
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="flex items-center py-5"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting ? "Deleting..." : "Delete Link"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the link and all associated
                                statistics.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
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
