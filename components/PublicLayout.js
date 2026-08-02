import Link from "next/link";
import { getContact } from "@/lib/data";
import { normalizeWhatsAppNumber } from "@/lib/contactDefaults";

export default async function PublicLayout({ children, contact: providedContact }) {
  const contact = providedContact || (await getContact());
  const whatsapp = normalizeWhatsAppNumber(contact?.contactNumber);
  const khaiwal = contact?.name || "";

  return (
    <>
      <div>
        <nav className="border-gray-200 bg-gradient-to-br from-blue-400 to-pink-700">
          <div className="flex flex-wrap items-center justify-center p-2">
            <Link title="Satta King 7 Home" href="/">
              <img
                className="block"
                src="/img/satta-king-24-logo.png"
                alt="Satta King 24 home"
                width="150"
                height="150"
              />
            </Link>
          </div>
        </nav>
        <nav className="bg-white">
          <div className="px-4 py-3 mx-auto md:px-6"><div className="flex items-center justify-center"><ul className="flex flex-row mt-2 mr-6 space-x-8 text-sm font-medium">
            <li><Link className="text-gray-900 hover:underline" href="/chart">Chart</Link></li>
            <li><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/918529357181`} className="text-gray-900 hover:underline">Play Now</a></li>
            <li><Link className="text-gray-900 hover:underline" href="/payment-proofs">Payment Proof</Link></li>
          </ul></div></div>
        </nav>
      </div>
      {children}
      <footer>
        <div className="button"><Link href="/">Satta king</Link></div>
        <div className="button"><Link href="/disclaimer">Disclaimer</Link></div>
        <div className="button"><Link href="/about-us">About Us</Link></div>
        <div className="button"><Link href="/blogs">Blogs</Link></div>
        <div className="button"><Link href="/privacy-policy">Privacy Policy</Link></div>
        <div className="button"><Link href="/faq">FAQ</Link></div>
        <div className="button"><Link href="/contact">Contact Us</Link></div>
      </footer>
      <a href={`https://wa.me/918950312367?text=VP%20bhai`} id="wa" className="floating" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <img src="/asset/WhatsApp_icon.png.webp" alt="" width="150" height="52" aria-hidden="true" />
      </a>
    </>
  );
}
