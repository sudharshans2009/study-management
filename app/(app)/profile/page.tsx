"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Mail, Calendar, Link as LinkIcon, Plus, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarUpload } from "@/components/media/avatar-upload";
import { updateProfile, updateAvatar, removeAvatar } from "@/actions/profile";
import { deleteFile } from "@/actions/media";

interface SocialLink {
  platform: string;
  url: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile state
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image || null);

  // Load existing profile picture when user data is available
  useEffect(() => {
    if (user?.image) {
      setAvatarUrl(user.image);
    }
  }, [user?.image]);

  const handleAddSocialLink = () => {
    if (socialLinks.length < 3) {
      setSocialLinks([...socialLinks, { platform: "", url: "" }]);
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSocialLinkChange = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await updateProfile({
        displayName,
        bio,
        socialLinks: socialLinks.map(link => JSON.stringify(link)),
      });

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setErrorMessage(result.error || "Failed to update profile");
      }
    } catch {
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    const result = await updateAvatar(url);
    
    if (result.success) {
      setAvatarUrl(url);
      setSuccessMessage("Profile picture updated successfully!");
    } else {
      setErrorMessage(result.error || "Failed to update profile picture");
    }
  };

  const handleAvatarRemove = async () => {
    // Delete the file from media storage if it exists
    if (avatarUrl && avatarUrl.startsWith("/api/media/")) {
      const pathParts = avatarUrl.replace("/api/media/", "").split("/");
      const filename = pathParts.pop() || "";
      await deleteFile(pathParts, filename);
    }

    // Remove from database
    const result = await removeAvatar();
    
    if (result.success) {
      setAvatarUrl(null);
      setSuccessMessage("Profile picture removed successfully!");
    } else {
      setErrorMessage(result.error || "Failed to remove profile picture");
    }
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
          <AlertDescription>Please sign in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your public profile information</p>
      </div>

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
          <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your profile details visible to others</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <AvatarUpload
              currentImage={avatarUrl}
              fallback={user.name?.charAt(0) || "U"}
              userId={user.id}
              onUploadSuccess={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              size="lg"
            />

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              ) : (
                <p className="text-sm py-2">{user.name}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-sm py-2 text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Email can be changed in settings</p>
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <p className="text-sm py-2 text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
            <CardDescription>Tell others about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                className="min-h-32 resize-none"
                maxLength={500}
              />
            ) : (
              <p className="text-sm py-2 text-muted-foreground">
                {bio || "No bio added yet. Click Edit Profile to add one."}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-2">{bio.length}/500 characters</p>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Add up to 3 social media links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.length === 0 && !isEditing ? (
              <p className="text-sm text-muted-foreground">No social links added yet.</p>
            ) : (
              socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  {isEditing ? (
                    <>
                      <div className="flex-1">
                        <Input
                          placeholder="Platform (e.g., Twitter, GitHub)"
                          value={link.platform}
                          onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSocialLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{link.platform}:</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}

            {isEditing && socialLinks.length < 3 && (
              <Button variant="outline" size="sm" onClick={handleAddSocialLink} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Social Link
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSuccessMessage("");
                setErrorMessage("");
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
