import type { Metadata } from "next";
import { PolicyLayout, PolicySection, POLICY_EMAIL } from "@/components/marketing/policy-layout";
import { LAB_PARTNER } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Terms of service — PrintDenture",
  description: "Terms for dental practices that order lab cases and capture devices from PrintDenture.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of service"
      description="PrintDenture is the ordering portal for licensed dental practices. The lab partner fabricates the case from the records you submit."
    >
      <PolicySection title="Who can order">
        <p>
          Accounts are for dental practices and their licensed providers. The license number,
          practice name, and shipping address on the account must be accurate.
        </p>
      </PolicySection>
      <PolicySection title="Your clinical responsibility">
        <p>
          You decide the treatment, obtain patient consent, and submit records that match the
          prescription. PrintDenture and {LAB_PARTNER.name} make the appliance from those records.
          They do not examine the patient.
        </p>
      </PolicySection>
      <PolicySection title="What you are buying">
        <p>
          A lab case includes the service shown at checkout. A printed full denture includes the
          printed try-in. A later design change adds a design fee. A design-only order does not
          include fabrication or a try-in. Capture devices are sold separately from lab cases.
        </p>
        <p>
          {LAB_PARTNER.name} designs and manufactures the appliance. PrintDenture runs the portal,
          payment, and case status.
        </p>
      </PolicySection>
      <PolicySection title="Payment">
        <p>
          The price is the amount shown at checkout. Lab work starts after payment, unless the case
          is a remake under the refund policy. The first-case offer applies to one complete denture
          case for a new practice. Capture devices are not included in that offer.
        </p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          PrintDenture, California, USA. {POLICY_EMAIL}.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
