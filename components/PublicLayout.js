import Link from "next/link";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME } from "@/lib/contactDefaults";

export default async function PublicLayout({ children }) {
  const whatsapp = DEFAULT_CONTACT_NUMBER;
  const khaiwal = DEFAULT_KHAIWAL_NAME;

  return (
    <>
      <div>
        <nav className="border-gray-200 bg-gradient-to-br from-blue-400 to-pink-700">
          <div className="flex flex-wrap items-center justify-center p-2">
            <Link title="Satta King 7 Home" href="/">
              <img className="block" alt="" src="/img/satta-king-24-logo.png" />
            </Link>
          </div>
        </nav>
        <nav className="bg-white">
          <div className="px-4 py-3 mx-auto md:px-6"><div className="flex items-center justify-center"><ul className="flex flex-row mt-2 mr-6 space-x-8 text-sm font-medium">
            <li><Link className="text-gray-900 hover:underline" href="/chart">Chart</Link></li>
            <li><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${whatsapp}`} className="text-gray-900 hover:underline">Play Now</a></li>
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
      <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(khaiwal)}`} id="wa" className="floating" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <img src="/asset/whatsapp.png" alt="" width="36" height="36" aria-hidden="true" />
      </a>
    </>
  );
}
