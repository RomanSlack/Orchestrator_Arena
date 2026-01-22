"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { parseGitHubUrl, validateRepositoryUrl } from "@/lib/github/client";
import type { Submission } from "@/types/database";

const submissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  repo_url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => parseGitHubUrl(url) !== null,
      "Must be a valid GitHub repository URL"
    ),
  demo_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface SubmissionFormProps {
  competitionId: string;
  userId: string;
  existingSubmission: Submission | null;
}

export function SubmissionForm({
  competitionId,
  userId,
  existingSubmission,
}: SubmissionFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: existingSubmission?.title || "",
    description: existingSubmission?.description || "",
    repo_url: existingSubmission?.repo_url || "",
    demo_url: existingSubmission?.demo_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [repoValidation, setRepoValidation] = useState<{
    loading: boolean;
    valid: boolean | null;
    message: string;
  }>({ loading: false, valid: null, message: "" });
  const [submitting, setSubmitting] = useState(false);

  const validateRepo = async () => {
    if (!formData.repo_url) {
      setRepoValidation({ loading: false, valid: null, message: "" });
      return;
    }

    setRepoValidation({ loading: true, valid: null, message: "Validating..." });

    try {
      const response = await fetch("/api/github/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.repo_url }),
      });

      const data = await response.json();

      if (data.valid) {
        setRepoValidation({
          loading: false,
          valid: true,
          message: `${data.repo?.full_name} - ${data.commits?.commitCount || 0} commits`,
        });
      } else {
        setRepoValidation({
          loading: false,
          valid: false,
          message: data.error || "Invalid repository",
        });
      }
    } catch {
      setRepoValidation({
        loading: false,
        valid: false,
        message: "Failed to validate repository",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = submissionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate repo if not already validated
    if (!repoValidation.valid) {
      await validateRepo();
      if (!repoValidation.valid) {
        setErrors({ repo_url: "Please enter a valid GitHub repository URL" });
        return;
      }
    }

    setSubmitting(true);

    try {
      const submissionData = {
        competition_id: competitionId,
        user_id: userId,
        title: formData.title,
        description: formData.description || null,
        repo_url: formData.repo_url,
        demo_url: formData.demo_url || null,
      };

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from("submissions")
          .update(submissionData)
          .eq("id", existingSubmission.id);

        if (error) {
          console.error("Error updating submission:", error);
          setErrors({ submit: "Failed to update submission. Please try again." });
          return;
        }
      } else {
        // Create new submission
        const { error } = await supabase.from("submissions").insert(submissionData);

        if (error) {
          console.error("Error creating submission:", error);
          setErrors({ submit: "Failed to create submission. Please try again." });
          return;
        }
      }

      router.push(`/competitions/${competitionId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="My Awesome Project"
          maxLength={100}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="A brief description of your project..."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/500 characters
        </p>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Repository URL */}
      <div className="space-y-2">
        <Label htmlFor="repo_url">GitHub Repository URL *</Label>
        <div className="flex gap-2">
          <Input
            id="repo_url"
            value={formData.repo_url}
            onChange={(e) => {
              setFormData({ ...formData, repo_url: e.target.value });
              setRepoValidation({ loading: false, valid: null, message: "" });
            }}
            placeholder="https://github.com/username/repo"
          />
          <Button
            type="button"
            variant="outline"
            onClick={validateRepo}
            disabled={!formData.repo_url || repoValidation.loading}
          >
            {repoValidation.loading ? "Checking..." : "Validate"}
          </Button>
        </div>
        {repoValidation.message && (
          <p
            className={`text-sm ${
              repoValidation.valid
                ? "text-green-600"
                : repoValidation.valid === false
                ? "text-red-500"
                : "text-muted-foreground"
            }`}
          >
            {repoValidation.valid === true && "✓ "}
            {repoValidation.valid === false && "✗ "}
            {repoValidation.message}
          </p>
        )}
        {errors.repo_url && (
          <p className="text-sm text-red-500">{errors.repo_url}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Repository must be public
        </p>
      </div>

      {/* Demo URL */}
      <div className="space-y-2">
        <Label htmlFor="demo_url">Demo URL (optional)</Label>
        <Input
          id="demo_url"
          value={formData.demo_url}
          onChange={(e) =>
            setFormData({ ...formData, demo_url: e.target.value })
          }
          placeholder="https://your-demo.vercel.app"
        />
        {errors.demo_url && (
          <p className="text-sm text-red-500">{errors.demo_url}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Link to a live demo or video walkthrough
        </p>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {errors.submit}
        </div>
      )}

      {/* Submit button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Submitting..."
            : existingSubmission
            ? "Update Submission"
            : "Submit Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/competitions/${competitionId}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
