import { Suspense } from "react";
import SignInInner from "./SignInInner";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-spotter-ink grid place-items-center text-spotter-mute text-xs">
          loading…
        </main>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
