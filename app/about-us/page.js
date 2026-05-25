import PublicLayout from "@/components/PublicLayout";

export const revalidate = 300;
export const metadata = { title: "About Us - Satta King 24" };

export default function AboutPage() {
  return (
    <PublicLayout>
      <main className="sk24-simple-page">
        <h1>About Us</h1>
        <p>Welcome to Satta King 24, your trusted source for the latest Satta King results and charts. We are dedicated to providing accurate and up-to-date information for Satta King enthusiasts.</p>
        <p>At Satta King 24, we understand the excitement and thrill of the game. Our team works tirelessly to ensure that you have access to the most recent results, including Gali, Desawar, Ghaziabad, and Faridabad. We also offer a comprehensive archive of old charts dating back to 2015, allowing you to analyze trends and patterns over the years.</p>
        <p>Thank you for choosing Satta King 24 as your go-to resource for Satta King results. We are committed to serving our community with integrity and excellence.</p>
      </main>
    </PublicLayout>
  );
}
