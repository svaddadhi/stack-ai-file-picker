import { SWRProvider } from "./providers/swr-provider";
import { AuthProvider } from "./components/auth/auth-provider";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <SWRProvider>
        <AuthProvider />
      </SWRProvider>
    </div>
  );
}
