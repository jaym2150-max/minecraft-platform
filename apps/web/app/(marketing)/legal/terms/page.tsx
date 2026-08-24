export default function TermsPage() {
  return (
    <main className="flex-1">
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Last updated: January 2026</p>
        </div>
      </section>
      <section className="container py-12 max-w-3xl prose prose-neutral dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Minecraft Platform, you agree to be bound by these Terms of Service.
          If you do not agree, you may not use the service.
        </p>
        <h2>2. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account.
        </p>
        <h2>3. Content Guidelines</h2>
        <p>
          Users may upload content provided it does not violate any laws or infringe on the rights of others.
          We reserve the right to remove content that violates these guidelines.
        </p>
        <h2>4. Limitation of Liability</h2>
        <p>
          The Minecraft Platform is provided &quot;as is&quot; without warranties of any kind. We are not
          liable for any damages arising from the use of our service.
        </p>
        <h2>5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Users will be notified of material changes.
        </p>
      </section>
    </main>
  );
}
