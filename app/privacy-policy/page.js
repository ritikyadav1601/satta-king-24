import PublicLayout from "@/components/PublicLayout";

export const revalidate = 300;
export const metadata = { title: "Privacy Policy - Satta King 24" };

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <main className="sk24-simple-page">
        <h1>Privacy Policy</h1>
        <p>At Satta King 24, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website.</p>
        <h2>Information We Collect</h2>
        <p>We may collect personal information such as your name, email address, and contact details when you voluntarily provide it to us through our contact forms or other interactions on our website. Additionally, we may collect non-personal information such as your IP address, browser type, and browsing behavior through cookies and similar technologies.</p>
        <h2>How We Use Your Information</h2>
        <p>The information we collect is used to improve our website, respond to your inquiries, and provide you with relevant updates and information. We do not sell or rent your personal information to third parties. However, we may share your data with trusted service providers who assist us in operating our website and delivering services to you.</p>
        <h2>Cookies</h2>
        <p>We use cookies to enhance your browsing experience and gather information about how our website is used. You can choose to disable cookies through your browser settings, but please note that this may affect the functionality of our site.</p>
        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is completely secure.</p>
        <h2>Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, contact us through the contact page and we will respond as soon as possible.</p>
      </main>
    </PublicLayout>
  );
}
