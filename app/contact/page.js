import PublicLayout from "@/components/PublicLayout";
import { getContact } from "@/lib/data";

export const revalidate = 300;
export const metadata = { title: "Contact Us - Satta King 24" };

export default async function ContactPage() {
  const contact = await getContact();
  const name = contact?.name || "Satta King 24";
  const number = contact?.contactNumber || "";
  return (
    <PublicLayout>
      <main className="sk24-simple-page">
        <div className="sk24-contact-card">
          <p><strong>नमस्कार साथियो</strong></p>
          <p><strong>अपनी गेम का रिजल्ट हमारी web साइट पर लगवाने के लिए संपर्क करें।</strong></p>
          <p><strong>----{name} ----</strong></p>
          {number ? (
            <p><a target="_blank" rel="noreferrer" href={`https://wa.me/+${number}?text=${encodeURIComponent(name)}`}><img loading="lazy" src="/asset/whatsapp.png" alt="Whatsapp to show game on this website" /></a></p>
          ) : null}
          <p>NOTE: इस नंबर पर लीक गेम नही मिलता गेम लेने वाले भाई कॉल या मैसेज न करें।</p>
        </div>
      </main>
    </PublicLayout>
  );
}
