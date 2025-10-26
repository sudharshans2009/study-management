"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  getUserTimezone,
  updateUserTimezone,
} from "@/actions/settings-actions";
import { getSubjectColorClasses } from "@/lib/subject-colors";
import { cn } from "@/lib/utils";
import { TIMEZONES, getTimezoneLabel } from "@/lib/timezone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile state
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image || null);

  // Study settings state
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [editingSubjectColor, setEditingSubjectColor] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(PRESET_COLORS[0]);
  const [editingDailyGoal, setEditingDailyGoal] = useState<number>(120);
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Asia/Kolkata");

  // Load existing profile picture when user data is available
  useEffect(() => {
    if (user?.image) {
      setAvatarUrl(user.image);
    }
  }, [user?.image]);

  // Fetch subjects with React Query
  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const result = await getUserSubjects();
      if (!result.success) {
        return [];
      }
      return result.data || [];
    },
    enabled: !!user,
  });

  // Fetch timezone with React Query
  const {
    data: userTimezone = "Asia/Kolkata",
    isLoading: isLoadingTimezone,
  } = useQuery({
    queryKey: ["userTimezone"],
    queryFn: async () => {
      const result = await getUserTimezone();
      if (!result.success) {
        return "Asia/Kolkata";
      }
      return result.data || "Asia/Kolkata";
    },
    enabled: !!user,
  });

  // Fetch daily goal with React Query
  const {
    data: dailyGoal = 120,
    isLoading: isLoadingGoal,
  } = useQuery({
    queryKey: ["dailyGoal"],
    queryFn: async () => {
      const result = await getDailyGoal();
      if (!result.success) {
        return 120;
      }
      return result.data || 120;
    },
    enabled: !!user,
  });

  const isLoadingSettings = isLoadingSubjects || isLoadingGoal || isLoadingTimezone;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName: string; bio: string; socialLinks: string[] }) => {
      const result = await updateProfile(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile");
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (url: string) => {
      const result = await updateAvatar(url);
      if (!result.success) {
        throw new Error(result.error || "Failed to update avatar");
      }
      return { url };
    },
    onSuccess: ({ url }) => {
      setAvatarUrl(url);
      setSuccessMessage("Profile picture updated successfully!");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile picture");
    },
  });

  // Remove avatar mutation
  const removeAvatarMutation = useMutation({
    mutationFn: async (currentAvatarUrl: string | null) => {
      // Delete the file from media storage if it exists
      if (currentAvatarUrl && currentAvatarUrl.startsWith("/api/media/")) {
        const pathParts = currentAvatarUrl.replace("/api/media/", "").split("/");
        const filename = pathParts.pop() || "";
        await deleteFile(pathParts, filename);
      }

      const result = await removeAvatar();
      if (!result.success) {
        throw new Error(result.error || "Failed to remove avatar");
      }
      return result;
    },
    onSuccess: () => {
      setAvatarUrl(null);
      setSuccessMessage("Profile picture removed successfully!");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove profile picture");
    },
  });

  // Update timezone mutation
  const updateTimezoneMutation = useMutation({
    mutationFn: async (timezone: string) => {
      const result = await updateUserTimezone(timezone);
      if (!result.success) {
        throw new Error(result.error || "Failed to update timezone");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Timezone updated successfully! Goals will reset at your local midnight.");
      queryClient.invalidateQueries({ queryKey: ["userTimezone"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update timezone");
    },
  });

  // Update daily goal mutation
  const updateDailyGoalMutation = useMutation({
    mutationFn: async (goal: number) => {
      const result = await updateDailyGoal(goal);
      if (!result.success) {
        throw new Error(result.error || "Failed to update daily goal");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Daily study goal updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dailyGoal"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update daily goal");
    },
  });

  // Add subject mutation
  const addSubjectMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const result = await addSubject(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to add subject");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Subject added successfully!");
      setNewSubjectName("");
      setNewSubjectColor(PRESET_COLORS[0]);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add subject");
    },
  });

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; color: string }) => {
      const result = await updateSubject(data.id, { name: data.name, color: data.color });
      if (!result.success) {
        throw new Error(result.error || "Failed to update subject");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Subject updated successfully!");
      setEditingSubjectId(null);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update subject");
    },
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const result = await deleteSubject(subjectId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete subject");
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Subject deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete subject");
    },
  });

  // Sync editing daily goal with fetched data
  useEffect(() => {
    setEditingDailyGoal(dailyGoal);
  }, [dailyGoal]);

  // Sync selected timezone with fetched data
  useEffect(() => {
    setSelectedTimezone(userTimezone);
  }, [userTimezone]);

  // Computed saving state from all mutations
  const isSaving =
    updateProfileMutation.isPending ||
    updateAvatarMutation.isPending ||
    removeAvatarMutation.isPending ||
    updateTimezoneMutation.isPending ||
    updateDailyGoalMutation.isPending ||
    addSubjectMutation.isPending ||
    updateSubjectMutation.isPending ||
    deleteSubjectMutation.isPending;

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

  const handleSaveProfile = () => {
    setSuccessMessage("");
    setErrorMessage("");
    updateProfileMutation.mutate({
      displayName,
      bio,
      socialLinks: socialLinks.map(link => JSON.stringify(link)),
    });
  };

  const handleAvatarUpload = (url: string) => {
    updateAvatarMutation.mutate(url);
  };

  const handleAvatarRemove = () => {
    removeAvatarMutation.mutate(avatarUrl);
  };

  // Study settings handlers
  const handleSaveDailyGoal = () => {
    setSuccessMessage("");
    setErrorMessage("");
    updateDailyGoalMutation.mutate(editingDailyGoal);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      setErrorMessage("Please enter a subject name");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    addSubjectMutation.mutate({
      name: newSubjectName.trim(),
      color: newSubjectColor,
    });
  };

  const handleStartEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
    setEditingSubjectColor(subject.color);
  };

  const handleSaveEditSubject = () => {
    if (!editingSubjectId || !editingSubjectName.trim()) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    updateSubjectMutation.mutate({
      id: editingSubjectId,
      name: editingSubjectName.trim(),
      color: editingSubjectColor,
    });
  };

  const handleCancelEditSubject = () => {
    setEditingSubjectId(null);
    setEditingSubjectName("");
    setEditingSubjectColor("");
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    deleteSubjectMutation.mutate(subjectId);
  };

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    setSuccessMessage("");
    setErrorMessage("");
    updateTimezoneMutation.mutate(timezone);
  };

  if (isLoadingSubjects || isLoadingGoal || isLoadingTimezone) {
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
                            {PRESET_COLORS.map((color) => {
                              const colorClasses = getSubjectColorClasses(color);
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all",
                                    colorClasses.bg,
                                    editingSubjectColor === color
                                      ? "border-foreground scale-110"
                                      : "border-transparent hover:scale-105"
                                  )}
                                  onClick={() => setEditingSubjectColor(color)}
                                  disabled={isSaving}
                                >
                                  <span className="sr-only">{color}</span>
                                </button>
                              );
                            })}
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
                            className={cn(
                              "w-4 h-4 rounded-full shrink-0",
                              getSubjectColorClasses(subject.color).bg
                            )}
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
                      {PRESET_COLORS.map((color) => {
                        const colorClasses = getSubjectColorClasses(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              colorClasses.bg,
                              newSubjectColor === color
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105"
                            )}
                            onClick={() => setNewSubjectColor(color)}
                            disabled={isSaving}
                          >
                            <span className="sr-only">{color}</span>
                          </button>
                        );
                      })}
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
                      value={editingDailyGoal}
                      onChange={(e) => setEditingDailyGoal(parseInt(e.target.value))}
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

          {/* Timezone Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Timezone
              </CardTitle>
              <CardDescription>
                Goals will reset at midnight in your timezone
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
                    <Label htmlFor="timezone">Your Timezone</Label>
                    <Select
                      value={selectedTimezone}
                      onValueChange={handleTimezoneChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger id="timezone" className="mt-2">
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Current timezone: {getTimezoneLabel(selectedTimezone)}
                    </p>
                  </div>
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
