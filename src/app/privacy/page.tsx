import { InfoPage } from "@/components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy policy">
      <p>SwapShelf stores account, listing, offer, message, and moderation data needed to run the marketplace.</p>
      <p>Public listing and profile details are visible to other members. Private messages are visible to conversation participants and admins when needed for safety review.</p>
    </InfoPage>
  );
}
