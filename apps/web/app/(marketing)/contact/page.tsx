export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-12">
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Have a question or need help? We would love to hear from you.
          </p>
        </div>
      </section>
      <section className="container max-w-2xl py-12">
        <div className="bg-card rounded-xl border p-8">
          <div className="space-y-6">
            <div>
              <h2 className="mb-1 font-semibold">Email</h2>
              <p className="text-muted-foreground">support@minecraftplatform.example.com</p>
            </div>
            <div>
              <h2 className="mb-1 font-semibold">Discord</h2>
              <p className="text-muted-foreground">
                Join our community Discord for real-time support.
              </p>
            </div>
            <div>
              <h2 className="mb-1 font-semibold">Report an Issue</h2>
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
