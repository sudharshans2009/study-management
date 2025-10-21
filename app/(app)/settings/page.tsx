"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Loader2, Github, Mail, Chrome, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Account settings state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OAuth connections
  const [connectedProviders, setConnectedProviders] = useState({
    github: false,
    google: false,
  });

  const handleSaveUsername = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Username updated successfully!");
    } catch {
      setErrorMessage("Failed to update username.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Verification email sent! Please check your inbox.");
    } catch {
      setErrorMessage("Failed to change email.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectOAuth = async (provider: "github" | "google") => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // TODO: Implement OAuth connection
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectedProviders({ ...connectedProviders, [provider]: true });
      setSuccessMessage(`${provider === "github" ? "GitHub" : "Google"} connected successfully!`);
    } catch {
      setErrorMessage(`Failed to connect ${provider === "github" ? "GitHub" : "Google"}.`);
    }
  };

  const handleDisconnectOAuth = async (provider: "github" | "google") => {
    try {
      // TODO: Implement OAuth disconnection
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectedProviders({ ...connectedProviders, [provider]: false });
      setSuccessMessage(`${provider === "github" ? "GitHub" : "Google"} disconnected.`);
    } catch {
      setErrorMessage(`Failed to disconnect ${provider === "github" ? "GitHub" : "Google"}.`);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    console.log("Delete account");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>Please sign in to access settings.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>Change your unique username</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
                <p className="text-xs text-muted-foreground">
                  This will be your unique identifier. Choose carefully!
                </p>
              </div>
              <Button onClick={handleSaveUsername} disabled={isSaving || !username}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Username
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>Update your email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Current Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  {user.emailVerified && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter new email address"
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send a verification email to your new address
                </p>
              </div>
              <Button onClick={handleChangeEmail} disabled={isSaving || email === user.email}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Send a password reset link to your email</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Send Reset Link</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Integrations</CardTitle>
              <CardDescription>Connect your account with third-party services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GitHub Connection */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Github className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">GitHub</h3>
                    <p className="text-sm text-muted-foreground">
                      {connectedProviders.github ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {connectedProviders.github ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnectOAuth("github")}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={() => handleConnectOAuth("github")}>Connect</Button>
                )}
              </div>

              {/* Google Connection */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Chrome className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google</h3>
                    <p className="text-sm text-muted-foreground">
                      {connectedProviders.google ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {connectedProviders.google ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnectOAuth("google")}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={() => handleConnectOAuth("google")}>Connect</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-destructive mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove
                  all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
