"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: number;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  job_type: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
  is_active: boolean;
  posted_date: string;
  closing_date?: string;
  created_by_name?: string;
}

interface JobFormData {
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  closing_date: string;
  is_active: boolean;
}

const API_URL = "https://api.samaabysiblings.com/backend/api/v1/jobs";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    job_type: "Full-time",
    description: "",
    requirements: "",
    responsibilities: "",
    salary_range: "",
    closing_date: "",
    is_active: true,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/all`);
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required");
      return;
    }

    try {
      const url = editingJob
        ? `${API_URL}/${editingJob.id}`
        : API_URL;
      
      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchJobs();
        setDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save job");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchJobs();
      } else {
        alert("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  const toggleActive = async (job: Job) => {
    try {
      const response = await fetch(`${API_URL}/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          is_active: !job.is_active,
        }),
      });

      if (response.ok) {
        await fetchJobs();
      } else {
        alert("Failed to update job status");
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
      alert("Failed to update job status");
    }
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      job_type: job.job_type || "Full-time",
      description: job.description || "",
      requirements: job.requirements || "",
      responsibilities: job.responsibilities || "",
      salary_range: job.salary_range || "",
      closing_date: job.closing_date?.split("T")[0] || "",
      is_active: job.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "",
      location: "",
      job_type: "Full-time",
      description: "",
      requirements: "",
      responsibilities: "",
      salary_range: "",
      closing_date: "",
      is_active: true,
    });
  };

  const handleChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">
            Manage job openings and career opportunities
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Job" : "Create New Job"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        handleChange("department", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => handleChange("job_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) =>
                        handleChange("salary_range", e.target.value)
                      }
                      placeholder="e.g., ₹8L - ₹12L"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="closing_date">Closing Date</Label>
                  <Input
                    id="closing_date"
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) =>
                      handleChange("closing_date", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      handleChange("responsibilities", e.target.value)
                    }
                    rows={4}
                    placeholder="List key responsibilities (one per line)"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleChange("requirements", e.target.value)
                    }
                    rows={4}
                    placeholder="List requirements (one per line)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingJob ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first job posting to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{job.title}</CardTitle>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {job.department && `${job.department} • `}
                      {job.location && `${job.location} • `}
                      {job.job_type}
                      {job.salary_range && ` • ${job.salary_range}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(job)}
                      title={job.is_active ? "Deactivate" : "Activate"}
                    >
                      {job.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(job)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                  {job.closing_date && (
                    <span>
                      Closes: {new Date(job.closing_date).toLocaleDateString()}
                    </span>
                  )}
                  {job.created_by_name && (
                    <span>By: {job.created_by_name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}