import React from "react";
import { useNavigate } from "react-router-dom";
import { checkCredentials } from "@/lib/auth";
import Footer from "@/components/Footer";
import { AuthLoading } from "@/components/AuthLoading";
import { useUser } from "@/lib/store";
import Header from "@/components/Header";
import { BACKEND_URL } from "@/consts/config";
import { Link } from "@/models/link";
import { getAxiosErrorMessage } from "@/lib/axios-error-handler";
import { notify } from "@/lib/notify";
import axios from "axios";
import { OutlineButton } from "@/components/ui/outline-button";
import { LinkCard } from "@/components/LinkCard";
import { Plus } from "lucide-react";

function NewLinkPage() {
  const navigate = useNavigate();
  const currentUser = useUser();

  const [links, setLinks] = React.useState<Link[]>([]);

  React.useEffect(() => {
    checkAuth().then(() => {
      getLinks();
    });
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

  const getLinks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/links`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sentinel_access_token")}`,
        },
      });
      const data = response.data;
      setLinks(data);
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
            <div className="flex flex-row items-center justify-between">
              <h2>My Links</h2>
              <OutlineButton onClick={() => navigate("/links/new")}>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Link
                </div>
              </OutlineButton>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
            <div className="flex flex-row items-center justify-between pt-8">
              <h2>All Links</h2>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}

export default NewLinkPage;
