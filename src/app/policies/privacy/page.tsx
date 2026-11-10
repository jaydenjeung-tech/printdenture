import type { Metadata } from "next";
import { PolicyLayout, PolicySection, POLICY_EMAIL } from "@/components/marketing/policy-layout";
import { LAB_PARTNER } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Privacy policy — PrintDenture",
  description: "What PrintDenture collects from a dental practice and who receives it.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy policy"
      description="We use practice and case information to make the appliance, take payment, and answer support. We do not sell it."
    >
      <PolicySection title="What we collect">
        <p>
          Account details you enter: name, email, practice name, license, phone, and shipping
          address. Case details you enter: patient name, chart number, shade, notes, and the scan
          files you upload. Support messages you send while signed in.
        </p>
        <p>
          Card numbers are entered on Stripe&apos;s checkout page. PrintDenture does not store the
          full card number.
        </p>
      </PolicySection>
      <PolicySection title="How it is used">
        <p>
          To create the account, price and ship the order, show case status, and reply to support.
          Patient details are used only for that case.
        </p>
      </PolicySection>
      <PolicySection title="Who receives it">
        <p>
          {LAB_PARTNER.name} receives the records and prescription needed to design and make the
          appliance. Stripe receives the payment. Email is sent through our mail provider to the
          address on the account. A design-only order is also sent to the design desk with the
          records for that order.
        </p>
        <p>We do not sell personal information.</p>
      </PolicySection>
      <PolicySection title="Asking about your data">
        <p>
          Email {POLICY_EMAIL} from the practice account email. Include the practice name and, if
          it is about a case, the case number.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
