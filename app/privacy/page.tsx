import type { Metadata } from "next";
import { LegalShell, Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — CarSpotter",
  description: "How CarSpotter collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 5, 2026">
      <p>
        CarSpotter (&ldquo;we&rdquo;, &ldquo;us&rdquo;) builds an AI car-identification app. This policy
        explains what we collect, why, and the control you have over your data. We
        designed CarSpotter to collect as little as possible.
      </p>

      <Section heading="Information we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-white">Account info.</strong> When you sign in we store your email address, a
            username you choose, and a Firebase user ID. You can also use the app as a guest.</li>
          <li><strong className="text-white">Photos you submit.</strong> When you scan a car, the photo is sent to our
            servers and AI vision providers to identify the vehicle. Photos you choose to post to
            the Feed are stored and shown publicly with your username.</li>
          <li><strong className="text-white">Usage data.</strong> We record how many scans you&rsquo;ve made (to enforce
            free-tier limits) and your saved Garage of identified cars.</li>
          <li><strong className="text-white">Optional location text.</strong> If you tag a post with a location, that
            text is stored with the post. We do not collect precise GPS location.</li>
          <li><strong className="text-white">Purchases.</strong> Subscriptions are processed by Apple. We receive a
            receipt to unlock features; we never see your card details.</li>
        </ul>
      </Section>

      <Section heading="How we use your information">
        <p>
          To identify cars from your photos, sync your Garage across your devices, run the social
          Feed, enforce subscription limits, and improve the app. We do not sell your personal
          data and we do not use third-party advertising or tracking SDKs.
        </p>
      </Section>

      <Section heading="Third parties who process data for us">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-white">Google Firebase</strong> — authentication, database, and image storage.</li>
          <li><strong className="text-white">OpenAI and Anthropic</strong> — AI vision models that identify the car in
            your photo and run content moderation on posts.</li>
          <li><strong className="text-white">Apple</strong> — subscription billing and receipt validation.</li>
        </ul>
        <p>Each processes data only to provide their service to us, under their own terms.</p>
      </Section>

      <Section heading="User-generated content & moderation">
        <p>
          The Feed lets users post photos and captions. To keep it safe we run automated
          moderation on every post before it publishes, let users report any post, and let users
          block any author. Reported content is reviewed within 24 hours and removed if it
          violates our <a href="/terms" className="text-spotter-cyan hover:underline">Terms of Use</a>.
        </p>
      </Section>

      <Section heading="Data retention & deletion">
        <p>
          We keep your data while your account is active. You can delete any post, clear your
          Garage, or request full account deletion by emailing{" "}
          <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>.
          We delete account data within 30 days of a verified request.
        </p>
      </Section>

      <Section heading="Children">
        <p>CarSpotter is rated 4+ but is not directed at children under 13, and we do not knowingly collect their data.</p>
      </Section>

      <Section heading="Your rights">
        <p>
          You may access, correct, export, or delete your personal data at any time. Email{" "}
          <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>{" "}
          and we&rsquo;ll respond within 30 days.
        </p>
      </Section>

      <Section heading="Changes">
        <p>We&rsquo;ll update this page if our practices change and revise the date above.</p>
      </Section>
    </LegalShell>
  );
}
