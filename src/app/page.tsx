import { SWRProvider } from "./providers/SWRProvider";
import { AuthProvider } from "./components/auth/AuthProvider";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <SWRProvider>
        <AuthProvider />
      </SWRProvider>
    </div>
  );
}
