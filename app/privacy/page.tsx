import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for AI SaaS Boilerplate",
};

/**
 * Privacy Policy Page
 * Standard privacy policy for SaaS boilerplate
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              This is a demonstration/portfolio project. We collect minimal information necessary for authentication and service provision:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Email Address:</strong> Collected solely for user authentication purposes. Your email is stored securely through our authentication provider (Supabase).</li>
              <li><strong>Payment Information:</strong> All payments are processed through Stripe. We do not store your payment details. Stripe handles all payment data in compliance with PCI DSS standards.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect only for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>To provide and maintain our authentication services</li>
              <li>To process payments through our payment processor (Stripe)</li>
              <li>To send you service-related notifications (if applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Payment Processing</h2>
            <p className="mb-4">
              All payment transactions are handled by Stripe, a third-party payment processor. We do not have access to your credit card details or full payment information. Stripe's use of your personal information is governed by their Privacy Policy, available at{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://stripe.com/privacy
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="mb-4">
              Your data is stored securely through our service providers. We use industry-standard security measures to protect your information. However, please note that no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Demo/Portfolio Notice</h2>
            <p className="mb-4">
              This is a demonstration/portfolio project. Payments are processed in test mode, and no real services are provided. This project is intended for demonstration purposes only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us through the contact information provided on our website.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
