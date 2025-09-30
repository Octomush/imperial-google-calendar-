import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Types for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleSignInConfig) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleSignInButtonConfig
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleSignInConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleSignInButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface CredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleSignInProps {
  clientId?: string;
  onSignInSuccess?: (user: any) => void;
  onSignInError?: (error: any) => void;
}

interface UserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  clientId = "974103121881-7cjsanm414l4v8in5jq0gben9gkervgk.apps.googleusercontent.com", // You'll need to replace this with your actual client ID
  onSignInSuccess,
  onSignInError,
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Decode JWT token to get user info
  const decodeJwtResponse = (token: string): UserInfo | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const handleCredentialResponse = (response: CredentialResponse) => {
    const userInfo = decodeJwtResponse(response.credential);

    if (userInfo) {
      console.log("Sign-in successful:", userInfo);
      setUser(userInfo);
      toast.success(`Welcome, ${userInfo.name}!`);
      onSignInSuccess?.(userInfo);
    } else {
      console.error("Failed to decode user information");
      toast.error("Failed to sign in. Please try again.");
      onSignInError?.("Failed to decode user information");
    }
  };

  const handleSignOut = () => {
    if (window.google && user) {
      window.google.accounts.id.disableAutoSelect();
      setUser(null);
      toast.success("Signed out successfully");
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: true,
          });

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });

          setIsGoogleLoaded(true);
        } catch (error) {
          console.error("Failed to initialize Google Sign-In:", error);
          toast.error("Failed to load Google Sign-In");
          onSignInError?.(error);
        }
      }
    };

    // Check if Google API is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google API to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (!window.google) {
          console.error("Google API failed to load");
          toast.error("Failed to load Google Sign-In");
        }
      }, 10000);

      return () => clearInterval(checkGoogleLoaded);
    }
  }, [clientId, onSignInSuccess, onSignInError]);

  if (!isGoogleLoaded && !user) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">
          Loading Google Sign-In...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg">
        <img
          src={user.picture}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Sign in with Google
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to access Google Calendar features
        </p>
      </div>
      <div ref={googleButtonRef}></div>
      {clientId === "YOUR_GOOGLE_CLIENT_ID" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You need to configure your Google Client ID.
            Please follow the setup instructions in the{" "}
            <a
              href="https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google Identity Services documentation
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;
