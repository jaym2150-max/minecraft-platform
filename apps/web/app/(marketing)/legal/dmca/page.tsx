export const metadata = {
  title: 'DMCA Policy',
  description:
    'How to file a DMCA copyright takedown request against content hosted on the Minecraft Platform.',
};

export default function DmcaPage() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-12">
          <h1 className="mb-4 text-4xl font-bold">DMCA Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: January 2026</p>
        </div>
      </section>
      <section className="prose prose-neutral dark:prose-invert container max-w-3xl py-12">
        <h2>1. Copyright Complaints</h2>
        <p>
          The Minecraft Platform respects the intellectual property rights of others. If you believe
          that content hosted on the platform infringes your copyright, you may submit a takedown
          notice under the Digital Millennium Copyright Act (&quot;DMCA&quot;).
        </p>
        <h2>2. Filing a Takedown Notice</h2>
        <p>
          A valid notice must include: (a) identification of the copyrighted work claimed to be
          infringed; (b) the URL or project page of the allegedly infringing material; (c) your
          contact information; (d) a statement of good-faith belief that the use is not authorized;
          and (e) a statement, under penalty of perjury, that the information in the notice is
          accurate and that you are the copyright owner or authorized to act on the owner&apos;s
          behalf.
        </p>
        <h2>3. Submission</h2>
        <p>
          Send notices through the <a href="/contact">contact page</a>, selecting &quot;Copyright /
          DMCA&quot; as the subject. We aim to acknowledge valid notices within 5 business days.
        </p>
        <h2>4. Counter-Notices</h2>
        <p>
          If your content was removed and you believe it was a mistake, you may file a
          counter-notice with the same level of detail. If valid, the material may be restored
          within 10–14 business days unless the original claimant files a court action.
        </p>
        <h2>5. Repeat Infringers</h2>
        <p>Accounts that repeatedly infringe copyrights may be suspended or terminated.</p>
      </section>
    </main>
  );
}
