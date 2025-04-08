import React from "react";
import axios from "axios";
import { BACKEND_URL } from "@/consts/config";
import { Card } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OutlineButton } from "@/components/ui/outline-button";
import { getAxiosErrorMessage } from "@/lib/axios-error-handler";
import { toast } from "@/components/ui/use-toast";

function ErrorPage() {
  const navigate = useNavigate();
  const [queryParameters] = useSearchParams();

  const [errorMessage, setErrorMessage] = React.useState("");
  const [serverMessage, setServerMessage] = React.useState("");

  React.useEffect(() => {
    ping();
    const error = queryParameters.get("message");
    if (error) {
      setErrorMessage(error);
    }
  }, []);

  const ping = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ping`);
      console.log(response.data);
      setServerMessage(response.data.message);
    } catch (error: any) {
      toast(getAxiosErrorMessage(error));
    }
  };

  const InvalidCodeCard = () => {
    return (
      <Card className="p-4 md:w-[500px] md:p-8">
        <div className="items-center">
          <img
            src="/logo/mechanic-logo.png"
            alt="Gaucho Racing"
            className="mx-auto h-20 md:h-24"
          />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Invalid Link
          </h1>
          <p className="mt-4">{errorMessage}</p>
          <OutlineButton
            className="mt-4 w-full"
            onClick={() => {
              navigate("/");
            }}
          >
            Back to GRLink
          </OutlineButton>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-between">
        <div className="w-full"></div>
        <div className="w-full items-center justify-center p-4 md:flex md:p-32">
          <InvalidCodeCard />
        </div>
        <div className="flex w-full justify-end p-4 text-gray-500">
          <p>{serverMessage}</p>
        </div>
      </div>
    </>
  );
}

export default ErrorPage;
