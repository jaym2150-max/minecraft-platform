export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have a question or need help? We would love to hear from you.
          </p>
        </div>
      </section>
      <section className="container py-12 max-w-2xl">
        <div className="rounded-xl border bg-card p-8">
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold mb-1">Email</h2>
              <p className="text-muted-foreground">support@minecraftplatform.example.com</p>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Discord</h2>
              <p className="text-muted-foreground">Join our community Discord for real-time support.</p>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Report an Issue</h2>
              <p className="text-muted-foreground">
                Found a bug? Open an issue on our GitHub repository.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
