export default function TeamsGuidePage() {
  return (
    <article>
      <h1>Managing Teams</h1>
      <p>
        Teams let you collaborate with other developers on the same project with role-based
        permissions.
      </p>

      <h2>Team Roles</h2>
      <ul>
        <li><strong>OWNER</strong> - Full control, can delete the project</li>
        <li><strong>ADMIN</strong> - Manage members, settings, and versions</li>
        <li><strong>DEVELOPER</strong> - Create and update versions</li>
        <li><strong>CONTRIBUTOR</strong> - View-only with comment permissions</li>
      </ul>

      <h2>Adding Members</h2>
      <p>
        Each project has exactly one team. To add members, the project owner or an admin can
        invite users by their username. Members receive a notification upon being added.
      </p>

      <h2>Changing Roles</h2>
      <p>
        Admins and the project owner can change member roles at any time. There must always
        be at least one OWNER.
      </p>

      <h2>Removing Members</h2>
      <p>
        Admins can remove members with any role. The owner role can only be transferred, not
        removed. If you need to leave your own project, transfer ownership to another member
        first.
      </p>

      <h2>Permissions</h2>
      <p>
        Different roles have different permissions across the platform:
      </p>
      <ul>
        <li><strong>Version uploads</strong> - DEVELOPER and above</li>
        <li><strong>Project settings</strong> - ADMIN and above</li>
        <li><strong>Team management</strong> - ADMIN and above</li>
        <li><strong>Project deletion</strong> - OWNER only</li>
      </ul>
    </article>
  );
}
