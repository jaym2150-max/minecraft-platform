export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-12">
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: January 2026</p>
        </div>
      </section>
      <section className="prose prose-neutral dark:prose-invert container max-w-3xl py-12">
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, including your username and
          email address. We also collect usage data such as page views and downloads to improve our
          service.
        </p>
        <h2>How We Use Your Information</h2>
        <p>
          Your information is used to provide and improve our services, communicate with you, and
          ensure platform security. We do not sell your personal data to third parties.
        </p>
        <h2>Data Security</h2>
        <p>
          We implement reasonable security measures to protect your data. However, no method of
          electronic storage is 100% secure.
        </p>
        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, please contact us at
          support@minecraftplatform.example.com.
        </p>
      </section>
    </main>
  );
}
