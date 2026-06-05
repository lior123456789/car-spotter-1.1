import type { Metadata } from "next";
import { LegalShell, Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Support — CarSpotter",
  description: "Get help with CarSpotter.",
};

export default function SupportPage() {
  return (
    <LegalShell title="Support" updated="June 5, 2026">
      <p>
        Need a hand? We&rsquo;re a small team and we answer fast. Email{" "}
        <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>{" "}
        and we&rsquo;ll get back to you within one business day.
      </p>

      <Section heading="Common questions">
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong className="text-white">How do I identify a car?</strong> Open the app, tap the camera, point at
            any car, and tap to scan. You can also upload a photo from your library.
          </li>
          <li>
            <strong className="text-white">Manage or cancel a subscription.</strong> Go to{" "}
            <em>Settings → Apple ID → Subscriptions</em> on your iPhone, select CarSpotter, and
            change or cancel your plan. Cancel at least 24 hours before renewal to avoid the next charge.
          </li>
          <li>
            <strong className="text-white">Restore purchases.</strong> Open the paywall in the app and tap
            &ldquo;Restore Purchases.&rdquo;
          </li>
          <li>
            <strong className="text-white">Report or block someone on the Feed.</strong> Tap the &ldquo;…&rdquo; menu on any
            post to report it or block its author. We review reports within 24 hours.
          </li>
          <li>
            <strong className="text-white">Delete my account or data.</strong> Email{" "}
            <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>{" "}
            from your account address and we&rsquo;ll remove your data within 30 days.
          </li>
        </ul>
      </Section>

      <Section heading="Still stuck?">
        <p>
          Email{" "}
          <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>{" "}
          with your device model and what happened, and we&rsquo;ll sort it out. Feature requests are
          welcome too — we ship fast.
        </p>
      </Section>

      <Section heading="Legal">
        <p>
          <a href="/privacy" className="text-spotter-cyan hover:underline">Privacy Policy</a> ·{" "}
          <a href="/terms" className="text-spotter-cyan hover:underline">Terms of Use</a>
        </p>
      </Section>
    </LegalShell>
  );
}
