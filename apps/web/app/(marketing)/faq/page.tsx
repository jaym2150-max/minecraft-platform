export default function FAQPage() {
  return (
    <main className="flex-1">
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Common questions about using the Minecraft Platform.
          </p>
        </div>
      </section>
      <section className="container py-12 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h2 className="font-semibold text-lg mb-2">How do I install mods?</h2>
            <p className="text-muted-foreground">
              Simply browse to the mod page and click the download button. You can use our desktop app for
              automatic installation, or manually place the files in your mods folder.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Is it safe to download mods?</h2>
            <p className="text-muted-foreground">
              Yes! Every file uploaded to our platform is automatically scanned for malware before being
              made available for download.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">How do I upload my own mod?</h2>
            <p className="text-muted-foreground">
              Create a creator account, then use the dashboard to submit your project. Make sure to include
              a description, screenshots, and compatible versions.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Can I update my mod after publishing?</h2>
            <p className="text-muted-foreground">
              Yes, you can upload new versions of your project at any time. Each version is scanned and
              reviewed before being published.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
