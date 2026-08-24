'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Shield,
  Bell,
  Mail,
  Lock,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Globe,
  Github,
  MessageSquare,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Trash2,
  Upload,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Key,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';
import { Label } from '@mcp/ui/components/label';
import { Switch } from '@mcp/ui/components/switch';
import { Badge } from '@mcp/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@mcp/ui/components/card';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';
import { toast } from 'sonner';
import { useAuth } from '@mcp/auth';
import { sdk } from '@/services/api';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { validateUsername, validatePassword } from '@mcp/utils/validators';

// ── Constants ──

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
];

interface NotificationSection {
  title: string;
  items: { id: string; label: string; description: string }[];
}

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'Mod Activity',
    items: [
      { id: 'newComments', label: 'New Comments', description: 'When someone comments on your mods' },
      { id: 'replies', label: 'Replies', description: 'When someone replies to your comment' },
      { id: 'reviews', label: 'Reviews', description: 'When your mod receives a new review' },
    ],
  },
  {
    title: 'Updates',
    items: [
      { id: 'newVersions', label: 'New Versions', description: 'When mods you follow publish new versions' },
      { id: 'statusChanges', label: 'Status Changes', description: 'When your mod\'s approval status changes' },
      { id: 'changelogs', label: 'Changelogs', description: 'Weekly digest of updates from followed mods' },
    ],
  },
  {
    title: 'Milestones',
    items: [
      { id: 'downloadMilestones', label: 'Download Milestones', description: 'When your mods reach milestone download counts' },
      { id: 'followerMilestones', label: 'Follower Milestones', description: 'When your follower count hits milestones' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'teamInvites', label: 'Team Invites', description: 'When you\'re invited to join a mod team' },
      { id: 'featured', label: 'Featured Content', description: 'When one of your mods gets featured' },
    ],
  },
];

// ── Helpers ──

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}****@${domain}`;
}

// ── Sub-components ──

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface SocialLinkInputProps {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function SocialLinkInput({ icon: Icon, placeholder, value, onChange }: SocialLinkInputProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

function SessionCard({ device, browser, location, time, current }: { device: string; browser: string; location: string; time: string; current?: boolean }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-card gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{device}</p>
            {current && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Current</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{browser}</p>
          <p className="text-xs text-muted-foreground">{location} · {time}</p>
        </div>
      </div>
      {!current && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ── Main Page ──

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [discord, setDiscord] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification state
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    newComments: true,
    replies: true,
    reviews: true,
    newVersions: true,
    statusChanges: true,
    changelogs: false,
    downloadMilestones: true,
    followerMilestones: false,
    teamInvites: true,
    featured: true,
  });

  // Validation errors
  const [usernameError, setUsernameError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio((user as any).bio || '');
      setWebsite((user as any).website || '');
      setGithub((user as any).githubId || '');
      setDiscord((user as any).discordId || '');
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to access settings');
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const toggleNotification = useCallback((id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    // Validate username
    if (user?.username) {
      const result = validateUsername(user.username);
      if (!result.valid) {
        setUsernameError(result.error || 'Invalid username');
        return;
      }
    }
    setUsernameError('');

    setSaving(true);
    try {
      const res = await sdk.updateProfile({
        displayName: displayName || undefined,
        bio: bio || undefined,
        website: website || undefined,
        githubId: github || undefined,
        discordId: discord || undefined,
      } as any);
      toast.success('Profile updated successfully');
      if (res.data) {
        updateUser(res.data as any);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [displayName, bio, website, github, discord, user, updateUser]);

  const handleChangePassword = useCallback(async () => {
    // Validate
    const errors: Record<string, string> = {};

    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const pwResult = validatePassword(newPassword);
      if (!pwResult.valid) errors.newPassword = pwResult.error || 'Invalid password';
    }
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordSaving(true);
    try {
      await sdk.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, user]);

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Signed out successfully');
    router.push('/');
  }, [logout, router]);

  const handleResendVerification = useCallback(async () => {
    setResendingVerification(true);
    try {
      await sdk.resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  }, []);

  const handleCopyApiKey = useCallback(() => {
    navigator.clipboard.writeText('mcp_api_' + (user?.id || '').slice(0, 8) + '...');
    toast.success('API key copied to clipboard');
  }, [user]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background">
          <div className="container py-8">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-border">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.username} fill sizes="56px" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{getInitials(user.username)}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account, profile, and preferences
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-56 shrink-0">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-24">
                {TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-3xl">
              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <SectionHeading title="Profile" />

                  {/* Avatar */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 ring-2 ring-border">
                          {user.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.username} fill sizes="80px" className="h-full w-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                              {getInitials(user.username)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Change Avatar
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG or WEBP. Max 2MB.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Your public display name and username</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Display Name">
                          <Input
                            placeholder="Your display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </FormField>
                        <FormField label="Username" error={usernameError}>
                          <div className="relative">
                            <Input
                              placeholder="username"
                              value={user.username}
                              disabled
                              className="pr-20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              locked
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Username changes are not currently supported.
                          </p>
                        </FormField>
                      </div>

                      <FormField label="Bio">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                          placeholder="Tell the community about yourself..."
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                      </FormField>
                    </CardContent>
                    <CardFooter className="border-t flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => {
                        setDisplayName(user.displayName || '');
                        setBio((user as any).bio || '');
                      }}>
                        Reset
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Social Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                      <CardDescription>Connect your social accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField label="Website">
                        <SocialLinkInput
                          icon={Globe}
                          placeholder="https://example.com"
                          value={website}
                          onChange={setWebsite}
                        />
                      </FormField>
                      <FormField label="GitHub">
                        <SocialLinkInput
                          icon={Github}
                          placeholder="https://github.com/username"
                          value={github}
                          onChange={setGithub}
                        />
                      </FormField>
                      <FormField label="Discord">
                        <SocialLinkInput
                          icon={MessageSquare}
                          placeholder="Discord username#0000"
                          value={discord}
                          onChange={setDiscord}
                        />
                      </FormField>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Account Tab ── */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <SectionHeading title="Account" />

                  {/* Email */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Address</CardTitle>
                      <CardDescription>Your verified email address</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{maskEmail(user.email)}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.emailVerified ? (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" /> Verified
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="h-3 w-3" /> Not verified
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {!user.emailVerified && (
                          <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resendingVerification}>
                            {resendingVerification ? (
                              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sending...</>
                            ) : (
                              'Resend Verification'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Change Password */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField label="Current Password" error={passwordErrors.currentPassword}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            className="pl-10 pr-10"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormField>

                      <FormField label="New Password" error={passwordErrors.newPassword}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            className="pl-10 pr-10"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormField>

                      {newPassword && (
                        <div className="space-y-1.5 text-xs">
                          <p className="text-muted-foreground">Password requirements:</p>
                          <ul className="space-y-1">
                            {[
                              { label: 'At least 8 characters', met: newPassword.length >= 8 },
                              { label: 'At least one uppercase letter', met: /[A-Z]/.test(newPassword) },
                              { label: 'At least one lowercase letter', met: /[a-z]/.test(newPassword) },
                              { label: 'At least one number', met: /[0-9]/.test(newPassword) },
                            ].map((req) => (
                              <li key={req.label} className={`flex items-center gap-1.5 ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                {req.met ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />}
                                {req.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <FormField label="Confirm New Password" error={passwordErrors.confirmPassword}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            className="pl-10 pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormField>
                    </CardContent>
                    <CardFooter className="border-t flex justify-end pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordSaving}
                        className="gap-2"
                      >
                        {passwordSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {passwordSaving ? 'Changing...' : 'Change Password'}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Two-Factor Authentication */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground">Protect your account with a second verification method</p>
                          </div>
                        </div>
                        <Switch checked={false} onCheckedChange={() => toast.info('2FA setup coming soon')} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Sessions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>Manage your active login sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
    <SessionCard
      device={typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? 'macOS' : 'Windows'}
      browser="Current Browser"
      location="This Session"
      time="Active now"
      current
    />
    <p className="text-xs text-muted-foreground text-center py-2">
      Session management requires a server-side sessions API.
    </p>
                      <div className="pt-2">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          Sign Out All Other Sessions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* API Access */}
                  <Card>
                    <CardHeader>
                      <CardTitle>API Access</CardTitle>
                      <CardDescription>Manage your API key for programmatic access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium font-mono text-muted-foreground">
                              mcp_api_{user.id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground">Created recently</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyApiKey}>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Rotate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-destructive/30">
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>Irreversible account actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-center gap-3">
                          <LogOut className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="text-sm font-medium">Sign Out</p>
                            <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1.5"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-center gap-3">
                          <Trash2 className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="text-sm font-medium">Delete Account</p>
                            <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1.5"
                          onClick={() => toast.info('Account deletion is not yet available')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Notifications Tab ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <SectionHeading title="Notification Preferences" />

                  <Card>
                    <CardContent className="pt-6 space-y-8">
                      {NOTIFICATION_SECTIONS.map((section) => (
                        <div key={section.title}>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{item.label}</p>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                                <Switch
                                  checked={notifications[item.id] ?? false}
                                  onCheckedChange={() => toggleNotification(item.id)}
                                />
                              </div>
                            ))}
                          </div>
                          {section !== NOTIFICATION_SECTIONS[NOTIFICATION_SECTIONS.length - 1] && (
                            <div className="border-b my-4" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="border-t flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => {
                        // Reset all to defaults
                        setNotifications({
                          newComments: true,
                          replies: true,
                          reviews: true,
                          newVersions: true,
                          statusChanges: true,
                          changelogs: false,
                          downloadMilestones: true,
                          followerMilestones: false,
                          teamInvites: true,
                          featured: true,
                        });
                        toast.success('Notifications reset to defaults');
                      }}>
                        Reset to Defaults
                      </Button>
    <Button onClick={async () => {
      try {
        await sdk.saveNotificationPreferences(notifications);
        toast.success('Notification preferences saved');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save preferences');
      }
    }} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Email Notification Frequency */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Frequency</CardTitle>
                      <CardDescription>How often you receive notification emails</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { value: 'instant', label: 'Instant', description: 'Receive emails immediately for each notification' },
                          { value: 'daily', label: 'Daily Digest', description: 'Receive a single daily email with all notifications' },
                          { value: 'weekly', label: 'Weekly Digest', description: 'Receive a weekly summary of your notifications' },
                          { value: 'never', label: 'Never', description: 'Don\'t send notification emails (in-app only)' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 p-3 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name="emailFrequency"
                              value={option.value}
                              defaultChecked={option.value === 'daily'}
                              className="h-4 w-4 text-primary accent-primary"
                            />
                            <div>
                              <p className="text-sm font-medium">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Appearance Tab ── */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <SectionHeading title="Appearance" />

                  <Card>
                    <CardHeader>
                      <CardTitle>Theme</CardTitle>
                      <CardDescription>Choose your preferred color theme</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: Sun, desc: 'Bright and clean' },
                          { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                          { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex flex-col items-center gap-2 p-6 rounded-xl border bg-card transition-all cursor-pointer ${
                              theme === option.value
                                ? 'border-primary ring-1 ring-primary bg-primary/5'
                                : 'hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <option.icon className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                              <p className="text-sm font-medium">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Layout Preferences</CardTitle>
                      <CardDescription>Customize how content is displayed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Compact Mode</p>
                          <p className="text-xs text-muted-foreground">Reduce spacing between elements</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Reduced Motion</p>
                          <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
