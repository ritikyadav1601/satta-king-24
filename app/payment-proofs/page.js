import fs from "node:fs/promises";
import path from "node:path";
import PublicLayout from "@/components/PublicLayout";

export const revalidate = 3600;
export const metadata = { title: "Payment Proof - Satta King 24" };

export default async function PaymentProofsPage() {
  const dir = path.join(process.cwd(), "public", "storage", "payment_proofs");
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
  } catch {}
  return (
    <PublicLayout>
      <main className="sk24-simple-page">
        <h1>Payment Proof</h1>
        <div className="sk24-proof-grid">
          {files.map((file) => <img key={file} src={`/storage/payment_proofs/${file}`} alt="Payment proof" loading="lazy" />)}
        </div>
      </main>
    </PublicLayout>
  );
}
