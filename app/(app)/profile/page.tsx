"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Mail, Calendar, Link as LinkIcon, Plus, X, Loader2, BookOpen, Target, Edit2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarUpload } from "@/components/media/avatar-upload";
import { updateProfile, updateAvatar, removeAvatar } from "@/actions/profile";
import { deleteFile } from "@/actions/media";
import {
  getUserSubjects,
  getDailyGoal,
  updateDailyGoal,
  addSubject,
  updateSubject,
  deleteSubject,
} from "@/actions/settings-actions";

interface SocialLink {
  platform: string;
  url: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

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

  // Study settings state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dailyGoal, setDailyGoal] = useState(120);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [editingSubjectColor, setEditingSubjectColor] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(PRESET_COLORS[0]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load existing profile picture when user data is available
  useEffect(() => {
    if (user?.image) {
      setAvatarUrl(user.image);
    }
  }, [user?.image]);

  // Load study settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const [subjectsResult, goalResult] = await Promise.all([
          getUserSubjects(),
          getDailyGoal(),
        ]);

        if (subjectsResult.success && subjectsResult.data) {
          setSubjects(subjectsResult.data);
        }

        if (goalResult.success && goalResult.data !== undefined) {
          setDailyGoal(goalResult.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

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

  // Study settings handlers
  const handleSaveDailyGoal = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await updateDailyGoal(dailyGoal);

      if (result.success) {
        setSuccessMessage("Daily study goal updated successfully!");
      } else {
        setErrorMessage(result.error || "Failed to update daily goal");
      }
    } catch {
      setErrorMessage("Failed to update daily goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      setErrorMessage("Please enter a subject name");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await addSubject({
        name: newSubjectName.trim(),
        color: newSubjectColor,
      });

      if (result.success) {
        // Reload subjects
        const subjectsResult = await getUserSubjects();
        if (subjectsResult.success && subjectsResult.data) {
          setSubjects(subjectsResult.data);
        }

        setNewSubjectName("");
        setNewSubjectColor(PRESET_COLORS[0]);
        setSuccessMessage("Subject added successfully!");
      } else {
        setErrorMessage(result.error || "Failed to add subject");
      }
    } catch {
      setErrorMessage("Failed to add subject. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
    setEditingSubjectColor(subject.color);
  };

  const handleSaveEditSubject = async () => {
    if (!editingSubjectId || !editingSubjectName.trim()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await updateSubject(editingSubjectId, {
        name: editingSubjectName.trim(),
        color: editingSubjectColor,
      });

      if (result.success) {
        // Reload subjects
        const subjectsResult = await getUserSubjects();
        if (subjectsResult.success && subjectsResult.data) {
          setSubjects(subjectsResult.data);
        }

        setEditingSubjectId(null);
        setSuccessMessage("Subject updated successfully!");
      } else {
        setErrorMessage(result.error || "Failed to update subject");
      }
    } catch {
      setErrorMessage("Failed to update subject. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditSubject = () => {
    setEditingSubjectId(null);
    setEditingSubjectName("");
    setEditingSubjectColor("");
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await deleteSubject(subjectId);

      if (result.success) {
        // Reload subjects
        const subjectsResult = await getUserSubjects();
        if (subjectsResult.success && subjectsResult.data) {
          setSubjects(subjectsResult.data);
        }

        setSuccessMessage("Subject deleted successfully!");
      } else {
        setErrorMessage(result.error || "Failed to delete subject");
      }
    } catch {
      setErrorMessage("Failed to delete subject. Please try again.");
    } finally {
      setIsSaving(false);
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

        {/* Study Settings Section */}
        <div className="pt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Study Settings
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage your courses and study goals
            </p>
          </div>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Study Subjects</CardTitle>
              <CardDescription>
                Manage the subjects you want to track
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No subjects added yet. Add your first subject below.
                </p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                    >
                      {editingSubjectId === subject.id ? (
                        <>
                          <div className="flex-1">
                            <Input
                              value={editingSubjectName}
                              onChange={(e) => setEditingSubjectName(e.target.value)}
                              placeholder="Subject name"
                              disabled={isSaving}
                            />
                          </div>
                          <div className="flex gap-1">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  editingSubjectColor === color
                                    ? "border-foreground scale-110"
                                    : "border-transparent hover:scale-105"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEditingSubjectColor(color)}
                                disabled={isSaving}
                              >
                                <span className="sr-only">{color}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={handleSaveEditSubject}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditSubject}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium flex-1">{subject.name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEditSubject(subject)}
                            disabled={isSaving}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteSubject(subject.id)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Subject */}
              {!isLoadingSettings && (
                <div className="pt-4 border-t space-y-3">
                  <Label>Add New Subject</Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Mathematics, Physics"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newSubjectColor === color
                              ? "border-foreground scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewSubjectColor(color)}
                          disabled={isSaving}
                        >
                          <span className="sr-only">{color}</span>
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={handleAddSubject}
                      disabled={isSaving || !newSubjectName.trim()}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Study Goal */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Study Goal
              </CardTitle>
              <CardDescription>
                Set your daily study time target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-lg font-semibold">
                      {Math.floor(dailyGoal / 60)}h{" "}
                      {dailyGoal % 60 > 0 ? `${dailyGoal % 60}m` : ""} per day
                    </Label>
                    <Input
                      type="range"
                      min="15"
                      max="480"
                      step="15"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                      className="mt-4"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: 2-4 hours per day for optimal learning
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveDailyGoal}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Daily Goal
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

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
