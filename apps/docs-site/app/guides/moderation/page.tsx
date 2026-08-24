export default function ModerationGuidePage() {
  return (
    <article>
      <h1>Content Moderation</h1>
      <p>
        How we keep the platform safe and welcoming for everyone.
      </p>

      <h2>What We Moderate</h2>
      <ul>
        <li><strong>Malware</strong> - Files are scanned automatically with ClamAV</li>
        <li><strong>Spam</strong> - Bulk uploads, fake reviews, link spam</li>
        <li><strong>Copyright</strong> - Unauthorized redistribution of others' work</li>
        <li><strong>Harassment</strong> - Personal attacks, doxxing, hate speech</li>
        <li><strong>NSFW content</strong> - Anything inappropriate for the platform's audience</li>
      </ul>

      <h2>Reporting Content</h2>
      <p>
        Any user can report a project, version, comment, or user account. Reports are
        reviewed by our moderation team. Click the "Report" button on any project or comment
        to submit a report.
      </p>

      <h2>What Happens After a Report</h2>
      <ol>
        <li>A moderator reviews the report</li>
        <li>They may take action: warning, takedown, or dismissal</li>
        <li>The reporter and reported user are notified of the resolution</li>
        <li>Repeat offenders may be suspended or banned</li>
      </ol>

      <h2>Appeals</h2>
      <p>
        If you believe a moderation action was made in error, you can appeal via the
        notification that was sent to you. The appeal will be reviewed by a different
        moderator.
      </p>

      <h2>Automatic Detection</h2>
      <p>
        All uploaded files are automatically scanned:
      </p>
      <ul>
        <li>ClamAV signature-based detection</li>
        <li>Heuristic analysis for new/unknown threats</li>
        <li>Format validation (e.g., is the file actually a valid JAR?)</li>
        <li>Size and structure checks</li>
      </ul>
    </article>
  );
}
