import PublicLayout from "@/components/PublicLayout";

export const revalidate = 300;
export const metadata = { title: "Disclaimer - Satta King 24" };

export default function DisclaimerPage() {
  return (
    <PublicLayout>
      <main className="sk24-simple-page">
        <h1>Disclaimer</h1>
        <p>The information provided on Satta King 24 is for general informational purposes only. While we strive to keep the information up-to-date and accurate, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.</p>
        <p>Satta King 24 does not endorse or promote gambling activities. The results and charts provided are for entertainment purposes only and should not be used for any illegal activities. We do not guarantee the accuracy of the results and charts displayed on the website.</p>
        <p>Users are advised to verify any information before relying on it. Satta King 24 will not be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>
        <p>Through this website, you may be able to link to other websites which are not under the control of Satta King 24. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.</p>
        <p>Every effort is made to keep the website up and running smoothly. However, Satta King 24 takes no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.</p>
      </main>
    </PublicLayout>
  );
}
