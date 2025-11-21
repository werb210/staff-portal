import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-1">
          <Badge>Staff Portal</Badge>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-slate-600">Access your staff portal account to continue.</p>
        </div>
        <Alert variant="info">
          <AlertTitle>Demo mode</AlertTitle>
          <AlertDescription>Sign-in flow is simulated for this preview.</AlertDescription>
        </Alert>
        <div className="grid gap-3">
          <Button>Continue</Button>
          <Button variant="secondary">Use single sign-on</Button>
        </div>
      </div>
    </main>
  );
}
