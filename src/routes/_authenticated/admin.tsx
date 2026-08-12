import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, LogOut, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  createMediaItem,
  deleteMediaItem,
  getAdminStatus,
  updateMediaItem,
} from "@/lib/media.functions";
import { mediaQueryOptions, mediaUrl, type MediaItem } from "@/lib/media";
import { site } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: `Curator Studio — ${site.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const getStatus = useServerFn(getAdminStatus);
  const { data: status, isPending } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getStatus(),
  });

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (!status?.isAdmin) {
    return <PendingAccess email={status?.email ?? null} />;
  }

  return <AdminStudio email={status.email} />;
}

function PendingAccess({ email }: { email: string | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {site.name}
      </p>
      <h1 className="mt-4 font-display text-4xl italic">Awaiting curator access</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        You're signed in{email ? ` as ${email}` : ""}, but this account doesn't hold the curator
        role yet. Once the role is granted in the backend, refresh this page.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="border border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
        >
          Sign out
        </button>
      </div>
      <Link
        to="/"
        className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
      >
        ← Back to the gallery
      </Link>
    </div>
  );
}

interface PendingFile {
  file: File;
  mediaType: "photo" | "video";
  width: number | null;
  height: number | null;
  previewUrl: string;
}

function probeFile(file: File): Promise<PendingFile> {
  const mediaType: "photo" | "video" = file.type.startsWith("video/") ? "video" : "photo";
  const previewUrl = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const done = (width: number | null, height: number | null) =>
      resolve({ file, mediaType, width, height, previewUrl });
    if (mediaType === "photo") {
      const img = new Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.onerror = () => done(null, null);
      img.src = previewUrl;
    } else {
      const video = document.createElement("video");
      video.onloadedmetadata = () => done(video.videoWidth, video.videoHeight);
      video.onerror = () => done(null, null);
      video.src = previewUrl;
    }
  });
}

function AdminStudio({ email }: { email: string | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(mediaQueryOptions);

  const createItem = useServerFn(createMediaItem);
  const updateItem = useServerFn(updateMediaItem);
  const deleteItem = useServerFn(deleteMediaItem);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [takenYear, setTakenYear] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editYear, setEditYear] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const invalidateMedia = () => queryClient.invalidateQueries({ queryKey: ["media"] });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      invalidateMedia();
      toast.success("Added to the gallery");
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: () => {
      invalidateMedia();
      toast.success("Piece updated");
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      invalidateMedia();
      toast.success("Piece removed");
      setConfirmingDeleteId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setTitle("");
    setCaption("");
    setLocation("");
    setTakenYear("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Choose an image or video file");
      return;
    }
    const probed = await probeFile(file);
    setPending(probed);
    if (!title) {
      setTitle(
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim(),
      );
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!pending || !title.trim()) return;
    try {
      setUploading("Uploading file…");
      const ext = pending.file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const filePath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, pending.file, { contentType: pending.file.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      setUploading("Saving details…");
      const year = takenYear.trim() ? Number.parseInt(takenYear.trim(), 10) : undefined;
      await createMutation.mutateAsync({
        data: {
          title: title.trim(),
          caption: caption.trim() || undefined,
          location: location.trim() || undefined,
          taken_year: Number.isFinite(year) ? year : undefined,
          media_type: pending.mediaType,
          file_path: filePath,
          mime_type: pending.file.type || undefined,
          width: pending.width ?? undefined,
          height: pending.height ?? undefined,
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCaption(item.caption ?? "");
    setEditLocation(item.location ?? "");
    setEditYear(item.taken_year ? String(item.taken_year) : "");
  };

  const saveEdit = (item: MediaItem) => {
    const year = editYear.trim() ? Number.parseInt(editYear.trim(), 10) : null;
    updateMutation.mutate({
      data: {
        id: item.id,
        title: editTitle.trim() || item.title,
        caption: editCaption.trim() || undefined,
        location: editLocation.trim() || undefined,
        taken_year: Number.isFinite(year) ? year : null,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    void navigate({ to: "/" });
  };

  const inputClass =
    "w-full border border-input bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent";
  const labelClass =
    "mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {site.name}
          </p>
          <h1 className="mt-1 font-display text-2xl italic">Curator Studio</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:block">
            {email}
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
          >
            View gallery
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <VisitorStats />
        <section className="border border-border/50 p-6 md:p-10">

          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Add a new piece
          </h2>

          <form onSubmit={handleUpload} className="mt-8 space-y-6">
            <div>
              <input
                ref={fileInputRef}
                id="media-file"
                type="file"
                accept="image/*,video/*"
                onChange={(event) => void handleFileChange(event)}
                className="sr-only"
              />
              <label
                htmlFor="media-file"
                className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-input px-6 py-12 text-center transition-colors hover:border-accent"
              >
                {pending ? (
                  pending.mediaType === "photo" ? (
                    <img
                      src={pending.previewUrl}
                      alt="Selected file preview"
                      className="max-h-48 object-contain"
                    />
                  ) : (
                    <video src={pending.previewUrl} muted className="max-h-48" />
                  )
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {pending ? pending.file.name : "Choose a photo or video"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Title *
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className={inputClass}
                  placeholder="Neon District"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className={labelClass}>
                    Location
                  </label>
                  <input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className={inputClass}
                    placeholder="Tokyo"
                  />
                </div>
                <div>
                  <label htmlFor="year" className={labelClass}>
                    Year
                  </label>
                  <input
                    id="year"
                    value={takenYear}
                    onChange={(event) => setTakenYear(event.target.value)}
                    className={inputClass}
                    placeholder="2026"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="caption" className={labelClass}>
                Caption
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="The story behind this frame…"
              />
            </div>

            <button
              type="submit"
              disabled={!pending || !title.trim() || uploading !== null}
              className="flex w-full items-center justify-center gap-3 bg-accent py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {uploading}
                </>
              ) : (
                "Publish to the gallery"
              )}
            </button>
          </form>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Collection · {items.length} {items.length === 1 ? "piece" : "pieces"}
          </h2>

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Nothing published yet — your first upload will appear here.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-border/50 border-y border-border/50">
              {items.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-20 shrink-0 overflow-hidden bg-secondary">
                      {item.media_type === "video" ? (
                        <video
                          src={mediaUrl(item.file_path)}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrl(item.file_path)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg italic">{item.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {item.media_type}
                        {item.location ? ` · ${item.location}` : ""}
                        {item.taken_year ? ` · ${item.taken_year}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (editingId === item.id ? setEditingId(null) : startEdit(item))}
                      aria-label={`Edit ${item.title}`}
                      className="p-2 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmingDeleteId === item.id) {
                          deleteMutation.mutate({ data: { id: item.id } });
                        } else {
                          setConfirmingDeleteId(item.id);
                          setTimeout(() => setConfirmingDeleteId(null), 4000);
                        }
                      }}
                      aria-label={`Delete ${item.title}`}
                      className={`p-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                        confirmingDeleteId === item.id
                          ? "text-destructive"
                          : "text-muted-foreground hover:text-destructive"
                      }`}
                    >
                      {confirmingDeleteId === item.id ? (
                        "Sure?"
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {editingId === item.id ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 border border-border/50 p-4 md:grid-cols-4">
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        aria-label="Title"
                        className={inputClass}
                      />
                      <input
                        value={editLocation}
                        onChange={(event) => setEditLocation(event.target.value)}
                        aria-label="Location"
                        placeholder="Location"
                        className={inputClass}
                      />
                      <input
                        value={editYear}
                        onChange={(event) => setEditYear(event.target.value)}
                        aria-label="Year"
                        placeholder="Year"
                        inputMode="numeric"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(item)}
                        disabled={updateMutation.isPending}
                        className="bg-primary px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      >
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </button>
                      <textarea
                        value={editCaption}
                        onChange={(event) => setEditCaption(event.target.value)}
                        aria-label="Caption"
                        placeholder="Caption"
                        rows={2}
                        className={`${inputClass} resize-none md:col-span-4`}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
