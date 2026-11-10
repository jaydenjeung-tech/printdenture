import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/marketing/policy-layout";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Refund and remake policy — PrintDenture",
  description: "When a PrintDenture lab case is remade, and when a capture device can be returned.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund and remake policy"
      description="Lab appliances are made for one prescription. A fabrication problem is remade. A change to the prescription is a new charge."
    >
      <PolicySection title="Free remake">
        <p>
          If the finished appliance does not match the records the practice submitted, or it has a
          fabrication defect, PrintDenture remakes that case without a second case fee. Email the
          case number and photos of the appliance. The original records must still be the ones the
          lab used.
        </p>
      </PolicySection>
      <PolicySection title="Not a remake">
        <p>
          A new shade, a new tooth setup, or a design change after the included printed try-in is
          not a free remake. That change adds a design fee before the final denture. A different
          prescription is a new case.
        </p>
        <p>
          A design-only order pays for the design that was ordered. A later revision is a new
          design order.
        </p>
      </PolicySection>
      <PolicySection title="Capture devices">
        <p>
          An unopened JB Tray or POP Bow kit can be returned within 30 days of delivery. Opened
          clinical kits are not returnable. Email before shipping anything back.
        </p>
      </PolicySection>
      <PolicySection title="Shipping and refunds">
        <p>
          Checkout adds ${SHIPPING_FLAT_RATE} for {SHIPPING_LABEL}. That shipping charge is not
          refunded after the package has shipped, except when PrintDenture ships a remake at its
          own cost. Approved refunds go back to the original payment method.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
