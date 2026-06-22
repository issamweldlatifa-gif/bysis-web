/**
 * AdminVideos.tsx — Admin Dashboard for Video Management
 * Allows admins to upload, edit, and manage hero and slider videos
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AdminVideos() {
  const [selectedTab, setSelectedTab] = useState<"hero" | "slider">("hero");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "hero" as "hero" | "slider",
    title: "",
    videoUrl: "",
    linkUrl: "/",
    displayOrder: 0,
  });

  // Queries
  const { data: videos, isLoading, refetch } = trpc.homepage.getVideos.useQuery();
  const createVideoMutation = trpc.homepage.createVideo.useMutation();
  const updateVideoMutation = trpc.homepage.updateVideo.useMutation();
  const deleteVideoMutation = trpc.homepage.deleteVideo.useMutation();

  const heroVideos = videos?.filter((v: any) => v.type === "hero") ?? [];
  const sliderVideos = videos?.filter((v: any) => v.type === "slider") ?? [];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
      if (!validTypes.includes(file.type)) {
        toast.error("صيغة الفيديو غير مدعومة. استخدم MP4 أو WebM");
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("حجم الفيديو كبير جداً. الحد الأقصى 100MB");
        return;
      }

      setUploadFile(file);
    }
  };

  // Handle video upload
  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("اختر فيديو أولاً");
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("file", uploadFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to backend
      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formDataToSend,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("فشل رفع الفيديو");
      }

      const data = await response.json();
      setUploadProgress(100);

      // Update form with uploaded URL
      setFormData(prev => ({
        ...prev,
        videoUrl: data.url,
      }));

      toast.success("تم رفع الفيديو بنجاح!");
      setUploadFile(null);
      setUploadProgress(0);

      // Auto-submit the form
      setTimeout(() => handleSaveVideo(), 500);
    } catch (error) {
      toast.error("خطأ في رفع الفيديو");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle save video
  const handleSaveVideo = async () => {
    if (!formData.title || !formData.videoUrl) {
      toast.error("ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (editingId) {
        await updateVideoMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("تم تحديث الفيديو بنجاح!");
      } else {
        await createVideoMutation.mutateAsync(formData);
        toast.success("تم إضافة الفيديو بنجاح!");
      }

      // Reset form
      setFormData({
        type: "hero",
        title: "",
        videoUrl: "",
        linkUrl: "/",
        displayOrder: 0,
      });
      setUploadFile(null);
      setEditingId(null);
      setIsUploadOpen(false);
      setIsEditOpen(false);

      // Refetch videos
      refetch();
    } catch (error) {
      toast.error("خطأ في حفظ الفيديو");
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteVideoMutation.mutateAsync({ id: deleteId });
      toast.success("تم حذف الفيديو بنجاح!");
      setDeleteId(null);
      refetch();
    } catch (error) {
      toast.error("خطأ في حذف الفيديو");
      console.error(error);
    }
  };

  // Handle edit
  const handleEdit = (video: any): void => {
    setFormData({
      type: video.type,
      title: video.title,
      videoUrl: video.videoUrl,
      linkUrl: video.linkUrl || "/",
      displayOrder: video.displayOrder,
    });
    setEditingId(video.id);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px 0" }}>إدارة الفيديوهات</h1>
        <p style={{ color: "#666", margin: 0 }}>أضف وعدّل وحذف الفيديوهات في الصفحة الرئيسية</p>
      </div>

      <Tabs value={selectedTab} onValueChange={(v: string) => setSelectedTab(v as "hero" | "slider")} style={{ marginBottom: "24px" }}>
        <TabsList>
          <TabsTrigger value="hero">فيديو البطل (Hero)</TabsTrigger>
          <TabsTrigger value="slider">فيديوهات الـ Slider</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>فيديو البطل</h2>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setFormData({ type: "hero", title: "", videoUrl: "", linkUrl: "/", displayOrder: 0 });
                  setEditingId(null);
                }}>
                  + إضافة فيديو
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فيديو جديد</DialogTitle>
                  <DialogDescription>اختر فيديو من جهازك وأضفه إلى الصفحة الرئيسية</DialogDescription>
                </DialogHeader>
                <VideoUploadForm
                  formData={formData}
                  setFormData={setFormData}
                  uploadFile={uploadFile}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                  onFileSelect={handleFileSelect}
                  onUpload={handleUpload}
                  onSave={handleSaveVideo}
                  fileInputRef={fileInputRef}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {heroVideos.length === 0 ? (
              <p style={{ color: "#999" }}>لا توجد فيديوهات حالياً</p>
            ) : (
              heroVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteId(video.id)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="slider">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>فيديوهات الـ Slider</h2>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setFormData({ type: "slider", title: "", videoUrl: "", linkUrl: "/", displayOrder: 0 });
                  setEditingId(null);
                }}>
                  + إضافة فيديو
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فيديو جديد</DialogTitle>
                  <DialogDescription>اختر فيديو من جهازك وأضفه إلى قسم الـ Slider</DialogDescription>
                </DialogHeader>
                <VideoUploadForm
                  formData={formData}
                  setFormData={setFormData}
                  uploadFile={uploadFile}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                  onFileSelect={handleFileSelect}
                  onUpload={handleUpload}
                  onSave={handleSaveVideo}
                  fileInputRef={fileInputRef}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {sliderVideos.length === 0 ? (
              <p style={{ color: "#999" }}>لا توجد فيديوهات حالياً</p>
            ) : (
              sliderVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteId(video.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الفيديو</DialogTitle>
          </DialogHeader>
          <VideoUploadForm
            formData={formData}
            setFormData={setFormData}
            uploadFile={uploadFile}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            onSave={handleSaveVideo}
            fileInputRef={fileInputRef}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفيديو</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الفيديو؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} style={{ background: "#dc2626" }}>حذف</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Video Upload Form Component
function VideoUploadForm({
  formData,
  setFormData,
  uploadFile,
  uploadProgress,
  isUploading,
  onFileSelect,
  onUpload,
  onSave,
  fileInputRef,
  isEdit = false,
}: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* File Upload */}
      <div>
        <Label>اختر فيديو</Label>
        <div
          style={{
            border: "2px dashed #ddd",
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#D4AF37";
            e.currentTarget.style.background = "rgba(212, 175, 55, 0.05)";
          }}
          onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.background = "transparent";
          }}
          onDrop={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.background = "transparent";
            const file = e.dataTransfer.files[0];
            if (file) {
              onFileSelect({ target: { files: [file] } });
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFileSelect(e)}
            style={{ display: "none" }}
          />
          {                uploadFile ? (
            <div>
              <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>✓ {(uploadFile as File).name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                {(((uploadFile as File).size) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>اسحب الفيديو هنا أو انقر للاختيار</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>MP4, WebM (الحد الأقصى 100MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>جاري الرفع...</span>
            <span style={{ fontSize: "12px", color: "#999" }}>{uploadProgress}%</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "#eee", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                background: "#D4AF37",
                transition: "width 0.2s",
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadFile && !formData.videoUrl && (
        <Button onClick={onUpload} disabled={isUploading} style={{ background: "#D4AF37", color: "#000" }}>
          {isUploading ? "جاري الرفع..." : "رفع الفيديو"}
        </Button>
      )}

      {/* Title */}
      <div>
        <Label>عنوان الفيديو</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="مثال: فيديو ترويجي"
        />
      </div>

      {/* Video URL (read-only after upload) */}
      {formData.videoUrl && (
        <div>
          <Label>رابط الفيديو</Label>
          <Input
            value={formData.videoUrl}
            readOnly
            style={{ background: "#f5f5f5" }}
          />
        </div>
      )}

      {/* Link URL (for slider only) */}
      {formData.type === "slider" && (
        <div>
          <Label>رابط الانتقال (اختياري)</Label>
          <Input
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            placeholder="/"
          />
        </div>
      )}

      {/* Display Order */}
      <div>
        <Label>ترتيب العرض</Label>
        <Input
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
          placeholder="0"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={!formData.title || !formData.videoUrl}
        style={{ background: "#D4AF37", color: "#000" }}
      >
        {isEdit ? "تحديث الفيديو" : "إضافة الفيديو"}
      </Button>
    </div>
  );
}

// Video Card Component
function VideoCard({ video, onEdit, onDelete }: any) {
  return (
    <Card style={{ padding: "16px" }}>
      <div style={{ marginBottom: "12px" }}>
        <video
          src={video.videoUrl}
          style={{
            width: "100%",
            height: "160px",
            background: "#000",
            borderRadius: "6px",
            objectFit: "cover",
          }}
          controls
        />
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>{video.title}</h3>
      <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#999" }}>
        {video.type === "hero" ? "فيديو البطل" : "Slider"} • الترتيب: {video.displayOrder}
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          onClick={() => onEdit(video)}
          variant="outline"
          style={{ flex: 1, fontSize: "12px" }}
        >
          تعديل
        </Button>
        <Button
          onClick={() => onDelete()}
          variant="outline"
          style={{ flex: 1, fontSize: "12px", color: "#dc2626", borderColor: "#dc2626" }}
        >
          حذف
        </Button>
      </div>
    </Card>
  );
}
