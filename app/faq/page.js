import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

export const revalidate = 300;
export const metadata = { title: "FAQ - Satta King 24" };

const faqs = [
  ["1. What is the result time for Shiv Dham market?", <>The <Link href="/chart">Shiv Dham result</Link> is usually declared at 01:25 PM every day.</>],
  ["2. What time does Pushkar Bazar result come?", "The Pushkar Bazar result is generally announced at 02:25 PM."],
  ["3. When is the Delhi Metro satta result declared?", "The Delhi Metro result is normally declared at 03:10 PM."],
  ["4. What is the Delhi Bazar result time?", "The Delhi Bazar result usually comes at 03:15 PM."],
  ["5. When does the Shri Sayam result come?", "The Shri Sayam result is typically declared at 04:20 PM."],
  ["6. What time is the Shri Ganesh result announced?", "The Shri Ganesh result is usually announced at 04:35 PM."],
  ["7. When is the Kolmbia result declared?", "The Kolmbia market result normally comes at 05:10 PM."],
  ["8. What time does the Faridabad result come?", <>The <Link href="/">Faridabad result</Link> is generally declared at 05:55 PM.</>],
  ["9. When is the Makka-Madina result announced?", "The Makka-Madina result usually comes at 07:25 PM."],
  ["10. What is the Ghaziabad result time?", "The Ghaziabad result is normally declared at 09:00 PM."],
  ["11. When does the Kalka Night result come?", "The Kalka Night result is usually announced at 10:00 PM."],
  ["12. What time is the Gali result declared?", "The Gali result generally comes at 11:50 PM."],
  ["13. When is the Desawer result announced?", "The Desawer result is usually declared early in the morning at 05:05 AM."]
];

export default function FaqPage() {
  return (
    <PublicLayout>
      <main className="sk24-simple-page faq-section">
        <h1>FAQs - Satta King 24</h1>
        {faqs.map(([question, answer]) => (
          <div className="faq-item" key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}
      </main>
    </PublicLayout>
  );
}
