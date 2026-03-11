import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const API_BASE = `${SUPABASE_URL}/functions/v1/admin-tribute-submissions`;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (ADMIN_SECRET) {
    (headers as Record<string, string>)["x-admin-key"] = ADMIN_SECRET;
  }
  return headers;
}

export interface TributeSubmission {
  id: string;
  full_name: string;
  birth_date: string | null;
  passing_date: string | null;
  picture_url: string | null;
  article_bio: string | null;
  submitter_name: string | null;
  status: string;
  city: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<TributeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TributeSubmission | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: getHeaders() });
      if (res.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Configure VITE_ADMIN_SECRET and ADMIN_SECRET (Edge Function) to match.",
          variant: "destructive",
        });
        setSubmissions([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load");
      setSubmissions(data.submissions ?? []);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load submissions.",
        variant: "destructive",
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (sub: TributeSubmission) => {
    setActionLoading(sub.id);
    try {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ id: sub.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Approve failed");
      toast({ title: "Approved", description: `${sub.full_name} is now published.` });
      await fetchSubmissions();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Approve failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRequest = (sub: TributeSubmission) => setDeleteTarget(sub);
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const name = deleteTarget.full_name;
    setDeleteTarget(null);
    setActionLoading(id);
    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Delete failed");
      toast({ title: "Deleted", description: `"${name}" has been removed.` });
      await fetchSubmissions();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Delete failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              ← Back to app
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin — Obituary Submissions</h1>
            <p className="text-muted-foreground text-sm">
              Approve or delete tribute submissions. Approved items appear on the Obituaries tab.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              {submissions.length} total · Pending approval or already approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
            ) : submissions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No submissions.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-medium">{sub.full_name}</div>
                        {sub.submitter_name && (
                          <div className="text-muted-foreground text-xs">by {sub.submitter_name}</div>
                        )}
                        {sub.article_bio && (
                          <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                            {sub.article_bio}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(sub.birth_date)} – {formatDate(sub.passing_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.status === "approved" ? "default" : "secondary"}>
                          {sub.status === "approved" ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(sub.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {sub.status !== "approved" && (
                            <Button
                              size="sm"
                              disabled={!!actionLoading}
                              onClick={() => handleApprove(sub)}
                            >
                              {actionLoading === sub.id ? "…" : "Approve"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!!actionLoading}
                            onClick={() => handleDeleteRequest(sub)}
                          >
                            {actionLoading === sub.id ? "…" : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the tribute for "{deleteTarget?.full_name}". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
