import type { Metadata } from "next";
import { LegalShell, Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Use (EULA) — CarSpotter",
  description: "The terms governing your use of CarSpotter.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use (EULA)" updated="June 5, 2026">
      <p>
        These Terms of Use (&ldquo;Terms&rdquo;) are a legal agreement between you and CarSpotter
        governing your use of the CarSpotter app. By downloading or using CarSpotter you agree to
        these Terms. If you do not agree, do not use the app.
      </p>

      <Section heading="License">
        <p>
          We grant you a personal, non-transferable, non-exclusive license to use CarSpotter on
          any Apple device you own or control, as permitted by the Apple App Store Terms of
          Service. This is the &ldquo;Licensed Application End User License Agreement&rdquo; required by
          Apple.
        </p>
      </Section>

      <Section heading="The service">
        <p>
          CarSpotter identifies cars from photos using AI vision and provides a Garage, a social
          Feed, and a Spot Map. AI identifications are best-effort estimates and may be inaccurate;
          do not rely on them for purchase, valuation, or safety decisions.
        </p>
      </Section>

      <Section heading="Zero tolerance for objectionable content & abuse">
        <p>
          The Feed lets users post content. By posting you agree there is{" "}
          <strong className="text-white">zero tolerance for objectionable content or abusive behavior</strong>.
          You will not post content that is unlawful, hateful, harassing, sexually explicit,
          violent, defamatory, infringing, spam, or that depicts or promotes harm to others.
        </p>
        <p>To keep the community safe, CarSpotter:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>filters every post with automated moderation before it is published;</li>
          <li>lets any user <strong className="text-white">report</strong> a post from the post menu;</li>
          <li>lets any user <strong className="text-white">block</strong> an author so they never see that user&rsquo;s content again;</li>
          <li>reviews reported content and removes violations <strong className="text-white">within 24 hours</strong>;</li>
          <li>terminates the accounts of users who repeatedly violate these Terms.</li>
        </ul>
        <p>
          You are solely responsible for content you post and grant us a license to host and
          display it within the app. We may remove any content and suspend or terminate any
          account at our discretion.
        </p>
      </Section>

      <Section heading="Subscriptions">
        <p>
          CarSpotter offers auto-renewable subscriptions (Spotter, Collector, Concours). Payment is
          charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically
          unless auto-renew is turned off at least 24 hours before the end of the current period.
          You can manage or cancel in <em>Settings → Apple ID → Subscriptions</em>. Free users
          receive 3 lifetime scans. Prices are shown in the app and may vary by region.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>
          Don&rsquo;t reverse-engineer the app, abuse the API, upload content you don&rsquo;t have rights to,
          or use CarSpotter to break the law. Don&rsquo;t impersonate others or interfere with the
          service.
        </p>
      </Section>

      <Section heading="Disclaimers & liability">
        <p>
          CarSpotter is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent
          permitted by law, we are not liable for indirect or consequential damages. Nothing here
          limits liability that cannot be limited by law.
        </p>
      </Section>

      <Section heading="Apple as third-party beneficiary">
        <p>
          Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce
          them. Apple has no obligation to provide support or handle claims relating to the app; we
          are solely responsible for the app and its content.
        </p>
      </Section>

      <Section heading="Termination">
        <p>
          We may suspend or terminate your access for any violation of these Terms. You may stop
          using the app at any time and request account deletion at{" "}
          <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these Terms?{" "}
          <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a>.
        </p>
      </Section>
    </LegalShell>
  );
}
