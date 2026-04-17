import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, FileText, HelpCircle, Handshake,
  Plus, Pencil, Trash2, Save, ArrowLeft, Eye, EyeOff,
  ExternalLink, LogOut, Upload, Image, Globe, Menu as MenuIcon,
  Search as SearchIcon, FolderOpen, Languages, Wand2,
  Link, ChevronRight, RotateCcw, Calendar, Clock,
  Loader2, ImageIcon, Video, FileIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════
// Shared hooks & utilities
// ═══════════════════════════════════════════════
const LOCALES = [
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const upload = async (file: File, folder = "general"): Promise<{ url: string; size: number }> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("cms-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("cms-assets").getPublicUrl(path);
      return { url: data.publicUrl, size: file.size };
    } finally {
      setUploading(false);
    }
  };
  return { upload, uploading };
};

// ═══════════════════════════════════════════════
// 1. CONTENT TAB
// ═══════════════════════════════════════════════
const ContentTab = () => {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ content_key: "", content_value: "", content_type: "text", section: "hero" });

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["cms_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cms_content").select("*").order("section").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addMut = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const { error } = await supabase.from("cms_content").insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_content"] }); setShowAdd(false); setNewItem({ content_key: "", content_value: "", content_type: "text", section: "hero" }); toast.success("Əlavə edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("cms_content").update({
        content_value: item.content_value, content_type: item.content_type, section: item.section,
        is_active: item.is_active, sort_order: item.sort_order, publish_at: item.publish_at || null, unpublish_at: item.unpublish_at || null,
      } as any).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_content"] }); setEditItem(null); toast.success("Yeniləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_content").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_content"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const sections = [...new Set(contents.map((c: any) => c.section))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sayt Məzmunu</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Əlavə et</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni məzmun</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Açar (key)</Label><Input value={newItem.content_key} onChange={e => setNewItem({ ...newItem, content_key: e.target.value })} placeholder="hero_title" /></div>
              <div><Label>Dəyər</Label><Textarea value={newItem.content_value} onChange={e => setNewItem({ ...newItem, content_value: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tip</Label>
                  <Select value={newItem.content_type} onValueChange={v => setNewItem({ ...newItem, content_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="text">Mətn</SelectItem><SelectItem value="number">Rəqəm</SelectItem><SelectItem value="html">HTML</SelectItem><SelectItem value="url">URL</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Bölmə</Label>
                  <Select value={newItem.section} onValueChange={v => setNewItem({ ...newItem, section: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="hero">Hero</SelectItem><SelectItem value="features">Xüsusiyyətlər</SelectItem><SelectItem value="stats">Statistika</SelectItem><SelectItem value="pricing">Qiymətlər</SelectItem><SelectItem value="general">Ümumi</SelectItem><SelectItem value="survey">Sorğu</SelectItem><SelectItem value="auth">Giriş</SelectItem><SelectItem value="dashboard">Panel</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => addMut.mutate(newItem)} disabled={!newItem.content_key || !newItem.content_value} className="w-full"><Save className="w-4 h-4 mr-1" /> Saxla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : contents.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Hələ heç bir məzmun yoxdur.</CardContent></Card>
      ) : (
        sections.map(section => (
          <div key={section} className="space-y-2">
            <Badge variant="outline" className="capitalize">{section}</Badge>
            {contents.filter((c: any) => c.section === section).map((item: any) => (
              <Card key={item.id} className="group">
                <CardContent className="py-3 px-4">
                  {editItem?.id === item.id ? (
                    <div className="space-y-2">
                      <Textarea value={editItem.content_value} onChange={e => setEditItem({ ...editItem, content_value: e.target.value })} />
                      <div className="flex flex-wrap items-center gap-2">
                        <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem({ ...editItem, is_active: v })} />
                        <Label className="text-xs">Aktiv</Label>
                        <Input type="number" className="w-20" value={editItem.sort_order} onChange={e => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} />
                        <Button size="sm" onClick={() => updateMut.mutate(editItem)}><Save className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}>Ləğv</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.content_key}</code>
                          {!item.is_active && <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3 mr-1" />Gizli</Badge>}
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{item.content_value}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditItem(item)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(item.id); }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 2. FAQ TAB
// ═══════════════════════════════════════════════
const FAQTab = () => {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["cms_faqs"],
    queryFn: async () => { const { data, error } = await supabase.from("cms_faqs").select("*").order("sort_order"); if (error) throw error; return data; },
  });

  const addMut = useMutation({
    mutationFn: async (item: typeof newFaq) => { const { error } = await supabase.from("cms_faqs").insert(item as any); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_faqs"] }); setShowAdd(false); setNewFaq({ question: "", answer: "" }); toast.success("FAQ əlavə edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async (item: any) => { const { error } = await supabase.from("cms_faqs").update({ question: item.question, answer: item.answer, is_active: item.is_active, sort_order: item.sort_order } as any).eq("id", item.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_faqs"] }); setEditItem(null); toast.success("Yeniləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_faqs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_faqs"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">FAQ</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Əlavə et</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni FAQ</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Sual</Label><Input value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} /></div>
              <div><Label>Cavab</Label><Textarea value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} rows={4} /></div>
              <Button onClick={() => addMut.mutate(newFaq)} disabled={!newFaq.question || !newFaq.answer} className="w-full"><Save className="w-4 h-4 mr-1" /> Saxla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : faqs.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">FAQ yoxdur.</CardContent></Card>
      ) : faqs.map((faq: any, i: number) => (
        <Card key={faq.id} className="group">
          <CardContent className="py-3 px-4">
            {editItem?.id === faq.id ? (
              <div className="space-y-2">
                <Input value={editItem.question} onChange={e => setEditItem({ ...editItem, question: e.target.value })} />
                <Textarea value={editItem.answer} onChange={e => setEditItem({ ...editItem, answer: e.target.value })} rows={3} />
                <div className="flex items-center gap-2">
                  <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem({ ...editItem, is_active: v })} /><Label className="text-xs">Aktiv</Label>
                  <Input type="number" className="w-20 ml-auto" value={editItem.sort_order} onChange={e => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} />
                  <Button size="sm" onClick={() => updateMut.mutate(editItem)}><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}>Ləğv</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-xs font-mono text-muted-foreground">#{i + 1}</span><span className="font-medium text-sm">{faq.question}</span>
                    {!faq.is_active && <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3" /></Badge>}
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditItem(faq)}><Pencil className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(faq.id); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 3. PARTNERS TAB
// ═══════════════════════════════════════════════
const PartnersTab = () => {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", logo_url: "", website_url: "" });
  const { upload, uploading } = useUpload();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["cms_partners"],
    queryFn: async () => { const { data, error } = await supabase.from("cms_partners").select("*").order("sort_order"); if (error) throw error; return data; },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, target: "new" | "edit") => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const { url } = await upload(file, "partner-logos");
      if (target === "new") setNewPartner(p => ({ ...p, logo_url: url }));
      else setEditItem((p: any) => ({ ...p, logo_url: url }));
      toast.success("Logo yükləndi");
    } catch (err: any) { toast.error(err.message); }
  };

  const addMut = useMutation({
    mutationFn: async (item: typeof newPartner) => { const { error } = await supabase.from("cms_partners").insert(item as any); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_partners"] }); setShowAdd(false); setNewPartner({ name: "", logo_url: "", website_url: "" }); toast.success("Əlavə edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async (item: any) => { const { error } = await supabase.from("cms_partners").update({ name: item.name, logo_url: item.logo_url, website_url: item.website_url, is_active: item.is_active, sort_order: item.sort_order } as any).eq("id", item.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_partners"] }); setEditItem(null); toast.success("Yeniləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_partners").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_partners"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tərəfdaşlar</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Əlavə et</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni tərəfdaş</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Ad</Label><Input value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} /></div>
              <div>
                <Label>Logo</Label>
                <div className="flex items-center gap-3 mt-1">
                  {newPartner.logo_url ? <img src={newPartner.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded border" /> : <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center text-muted-foreground"><Image className="w-5 h-5" /></div>}
                  <label className="cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "new")} disabled={uploading} />
                    <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"><Upload className="w-3.5 h-3.5" /> {uploading ? "..." : "Yüklə"}</span>
                  </label>
                </div>
              </div>
              <div><Label>Veb-sayt</Label><Input value={newPartner.website_url} onChange={e => setNewPartner({ ...newPartner, website_url: e.target.value })} placeholder="https://..." /></div>
              <Button onClick={() => addMut.mutate(newPartner)} disabled={!newPartner.name || uploading} className="w-full"><Save className="w-4 h-4 mr-1" /> Saxla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : partners.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Partner yoxdur.</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {partners.map((p: any) => (
            <Card key={p.id} className="group">
              <CardContent className="py-3 px-4">
                {editItem?.id === p.id ? (
                  <div className="space-y-2">
                    <Input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
                    <div className="flex items-center gap-3">
                      {editItem.logo_url ? <img src={editItem.logo_url} alt="" className="w-10 h-10 object-contain rounded border" /> : <div className="w-10 h-10 rounded border border-dashed flex items-center justify-center text-muted-foreground"><Image className="w-4 h-4" /></div>}
                      <label className="cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "edit")} disabled={uploading} />
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-muted"><Upload className="w-3 h-3" /> {uploading ? "..." : "Dəyiş"}</span>
                      </label>
                    </div>
                    <Input value={editItem.website_url || ""} onChange={e => setEditItem({ ...editItem, website_url: e.target.value })} placeholder="URL" />
                    <div className="flex items-center gap-2">
                      <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem({ ...editItem, is_active: v })} /><Label className="text-xs">Aktiv</Label>
                      <Button size="sm" className="ml-auto" onClick={() => updateMut.mutate(editItem)}><Save className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}>Ləğv</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.logo_url ? <img src={p.logo_url} alt={p.name} className="w-10 h-10 object-contain rounded" /> : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-bold">{p.name[0]}</div>}
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.website_url && <a href={p.website_url} target="_blank" rel="noopener" className="text-xs text-muted-foreground hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Sayt</a>}
                      </div>
                      {!p.is_active && <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3" /></Badge>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditItem(p)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 4. MEDIA LIBRARY TAB
// ═══════════════════════════════════════════════
const MediaTab = () => {
  const qc = useQueryClient();
  const { upload, uploading } = useUpload();
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["cms_media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cms_media").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMut = useMutation({
    mutationFn: async (item: { file_name: string; file_url: string; file_type: string; file_size: number; folder: string }) => {
      const { error } = await supabase.from("cms_media").insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_media"] }); toast.success("Fayl yükləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_media").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_media"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const folder = selectedFolder === "all" ? "general" : selectedFolder;
        const { url, size } = await upload(file, folder);
        const fileType = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "file";
        addMut.mutate({ file_name: file.name, file_url: url, file_type: fileType, file_size: size, folder });
      } catch (err: any) { toast.error(err.message); }
    }
    e.target.value = "";
  };

  const folders = ["all", ...new Set((media as any[]).map((m: any) => m.folder).filter(Boolean))];
  const filtered = (media as any[]).filter((m: any) => {
    if (selectedFolder !== "all" && m.folder !== selectedFolder) return false;
    if (search && !m.file_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success("URL kopyalandı"); };

  const getIcon = (type: string) => {
    if (type === "image") return <ImageIcon className="w-4 h-4" />;
    if (type === "video") return <Video className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold">Media Kitabxanası</h3>
        <label className="cursor-pointer">
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          <span className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> {uploading ? "Yüklənir..." : "Fayl yüklə"}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Axtar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[150px]"><FolderOpen className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>{folders.map(f => <SelectItem key={f} value={f}>{f === "all" ? "Hamısı" : f}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Hələ fayl yoxdur. "Fayl yüklə" düyməsini basın.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((m: any) => (
            <Card key={m.id} className="group overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {m.file_type === "image" ? (
                  <img src={m.file_url} alt={m.alt_text || m.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">{getIcon(m.file_type)}</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(m.file_url)}><Link className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(m.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{m.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(m.file_size || 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 5. TRANSLATIONS TAB (AI powered)
// ═══════════════════════════════════════════════
const TranslationsTab = () => {
  const qc = useQueryClient();
  const [selectedTable, setSelectedTable] = useState("cms_content");
  const [translating, setTranslating] = useState(false);

  const { data: contents = [] } = useQuery({
    queryKey: ["cms_content_all"],
    queryFn: async () => { const { data } = await supabase.from("cms_content").select("*").order("section").order("sort_order"); return data || []; },
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ["cms_faqs_all"],
    queryFn: async () => { const { data } = await supabase.from("cms_faqs").select("*").order("sort_order"); return data || []; },
  });

  const { data: translations = [], refetch: refetchTranslations } = useQuery({
    queryKey: ["cms_translations", selectedTable],
    queryFn: async () => { const { data } = await supabase.from("cms_translations").select("*").eq("content_table", selectedTable); return data || []; },
  });

  const getTranslation = (contentId: string, locale: string, field: string) => {
    return (translations as any[]).find((t: any) => t.content_id === contentId && t.locale === locale && t.field_name === field)?.translated_value || "";
  };

  const saveTranslation = useMutation({
    mutationFn: async ({ content_id, locale, field_name, value }: { content_id: string; locale: string; field_name: string; value: string }) => {
      const { error } = await supabase.from("cms_translations").upsert({
        content_table: selectedTable, content_id, locale, field_name, translated_value: value,
      } as any, { onConflict: "content_table,content_id,locale,field_name" });
      if (error) throw error;
    },
    onSuccess: () => { refetchTranslations(); toast.success("Tərcümə saxlanıldı"); },
    onError: (e: any) => toast.error(e.message),
  });

  const translateAll = async (targetLocale: string) => {
    setTranslating(true);
    try {
      const items = selectedTable === "cms_content" ? contents : faqs;
      const textsToTranslate: { id: string; field: string; text: string }[] = [];

      (items as any[]).forEach((item: any) => {
        if (selectedTable === "cms_content") {
          textsToTranslate.push({ id: item.id, field: "content_value", text: item.content_value });
        } else {
          textsToTranslate.push({ id: item.id, field: "question", text: item.question });
          textsToTranslate.push({ id: item.id, field: "answer", text: item.answer });
        }
      });

      if (textsToTranslate.length === 0) { toast.info("Tərcümə ediləcək məzmun yoxdur"); return; }

      // Batch in groups of 10
      const batchSize = 10;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        const { data: session } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ texts: batch.map(b => b.text), target_locale: targetLocale, source_locale: "az" }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Tərcümə xətası");
        }

        const { translations: translated } = await res.json();
        for (let j = 0; j < batch.length; j++) {
          if (translated[j]) {
            await supabase.from("cms_translations").upsert({
              content_table: selectedTable, content_id: batch[j].id, locale: targetLocale,
              field_name: batch[j].field, translated_value: translated[j],
            } as any, { onConflict: "content_table,content_id,locale,field_name" });
          }
        }
      }

      refetchTranslations();
      toast.success(`${targetLocale.toUpperCase()} dilinə tərcümə tamamlandı!`);
    } catch (err: any) {
      toast.error(err.message || "Tərcümə xətası");
    } finally {
      setTranslating(false);
    }
  };

  const items = selectedTable === "cms_content" ? contents : faqs;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Languages className="w-5 h-5" /> Tərcümələr</h3>
        <div className="flex gap-2">
          {LOCALES.filter(l => l.code !== "az").map(locale => (
            <Button key={locale.code} size="sm" variant="outline" disabled={translating} onClick={() => translateAll(locale.code)} className="gap-1.5">
              {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {locale.flag} AI ilə {locale.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={selectedTable === "cms_content" ? "default" : "outline"} onClick={() => setSelectedTable("cms_content")}>Məzmun</Button>
        <Button size="sm" variant={selectedTable === "cms_faqs" ? "default" : "outline"} onClick={() => setSelectedTable("cms_faqs")}>FAQ</Button>
      </div>

      {(items as any[]).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Əvvəlcə məzmun əlavə edin.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(items as any[]).map((item: any) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">🇦🇿 AZ</Badge>
                  <span className="text-sm font-medium">{selectedTable === "cms_content" ? item.content_key : item.question}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedTable === "cms_content" ? item.content_value : item.answer}</p>

                {LOCALES.filter(l => l.code !== "az").map(locale => {
                  const fields = selectedTable === "cms_content" ? ["content_value"] : ["question", "answer"];
                  return (
                    <div key={locale.code} className="border-t pt-2">
                      <Badge variant="secondary" className="mb-1">{locale.flag} {locale.code.toUpperCase()}</Badge>
                      {fields.map(field => {
                        const val = getTranslation(item.id, locale.code, field);
                        return (
                          <div key={field} className="mt-1">
                            {fields.length > 1 && <Label className="text-xs text-muted-foreground capitalize">{field}</Label>}
                            <Textarea
                              value={val}
                              onChange={e => {
                                // Local update
                                qc.setQueryData(["cms_translations", selectedTable], (old: any[]) => {
                                  const existing = old?.find((t: any) => t.content_id === item.id && t.locale === locale.code && t.field_name === field);
                                  if (existing) return old.map((t: any) => t === existing ? { ...t, translated_value: e.target.value } : t);
                                  return [...(old || []), { content_id: item.id, locale: locale.code, field_name: field, translated_value: e.target.value, content_table: selectedTable }];
                                });
                              }}
                              onBlur={e => {
                                if (e.target.value) saveTranslation.mutate({ content_id: item.id, locale: locale.code, field_name: field, value: e.target.value });
                              }}
                              rows={2}
                              placeholder={`${locale.label} tərcüməsi...`}
                              className="text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 6. MENU BUILDER TAB
// ═══════════════════════════════════════════════
const MenuBuilderTab = () => {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [menuGroup, setMenuGroup] = useState("main_nav");
  const [newMenu, setNewMenu] = useState({ label: "", url: "", icon: "", menu_group: "main_nav", parent_id: null as string | null, open_in_new_tab: false });

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ["cms_menus"],
    queryFn: async () => { const { data, error } = await supabase.from("cms_menus").select("*").order("sort_order"); if (error) throw error; return data; },
  });

  const addMut = useMutation({
    mutationFn: async (item: any) => { const { error } = await supabase.from("cms_menus").insert(item as any); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_menus"] }); setShowAdd(false); setNewMenu({ label: "", url: "", icon: "", menu_group: "main_nav", parent_id: null, open_in_new_tab: false }); toast.success("Menyu əlavə edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("cms_menus").update({
        label: item.label, url: item.url, icon: item.icon, is_active: item.is_active,
        sort_order: item.sort_order, parent_id: item.parent_id, open_in_new_tab: item.open_in_new_tab, menu_group: item.menu_group,
      } as any).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_menus"] }); setEditItem(null); toast.success("Yeniləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_menus").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_menus"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const grouped = (menus as any[]).filter((m: any) => m.menu_group === menuGroup);
  const topLevel = grouped.filter((m: any) => !m.parent_id);
  const getChildren = (parentId: string) => grouped.filter((m: any) => m.parent_id === parentId);

  const iconOptions = ["Home", "LayoutDashboard", "UserCog", "ClipboardCheck", "MessageSquare", "Brain", "Users", "BarChart3", "Settings", "HelpCircle", "Mail", "Phone", "Globe", "Star", "Heart", "Shield"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2"><MenuIcon className="w-5 h-5" /> Menyu Builder</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Menyu əlavə et</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni menyu elementi</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Ad</Label><Input value={newMenu.label} onChange={e => setNewMenu({ ...newMenu, label: e.target.value })} placeholder="Ana Səhifə" /></div>
              <div><Label>URL</Label><Input value={newMenu.url} onChange={e => setNewMenu({ ...newMenu, url: e.target.value })} placeholder="/dashboard" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>İkon</Label>
                  <Select value={newMenu.icon} onValueChange={v => setNewMenu({ ...newMenu, icon: v })}>
                    <SelectTrigger><SelectValue placeholder="İkon seç" /></SelectTrigger>
                    <SelectContent>{iconOptions.map(ic => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Qrup</Label>
                  <Select value={newMenu.menu_group} onValueChange={v => setNewMenu({ ...newMenu, menu_group: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main_nav">Əsas menyu</SelectItem>
                      <SelectItem value="footer">Alt menyu</SelectItem>
                      <SelectItem value="sidebar">Yan menyu</SelectItem>
                      <SelectItem value="landing_nav">Landing menyu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Üst menyu (alt-menyu üçün)</Label>
                <Select value={newMenu.parent_id || "none"} onValueChange={v => setNewMenu({ ...newMenu, parent_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Yoxdur (əsas menyu)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Yoxdur (əsas)</SelectItem>
                    {topLevel.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newMenu.open_in_new_tab} onCheckedChange={v => setNewMenu({ ...newMenu, open_in_new_tab: v })} />
                <Label className="text-sm">Yeni tabda aç</Label>
              </div>
              <Button onClick={() => addMut.mutate(newMenu)} disabled={!newMenu.label} className="w-full"><Save className="w-4 h-4 mr-1" /> Saxla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {["main_nav", "landing_nav", "footer", "sidebar"].map(g => (
          <Button key={g} size="sm" variant={menuGroup === g ? "default" : "outline"} onClick={() => setMenuGroup(g)}>
            {g === "main_nav" ? "Əsas" : g === "landing_nav" ? "Landing" : g === "footer" ? "Alt" : "Yan"}
          </Button>
        ))}
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : topLevel.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Bu qrupda menyu yoxdur.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {topLevel.map((menu: any) => (
            <div key={menu.id}>
              <Card className="group">
                <CardContent className="py-3 px-4">
                  {editItem?.id === menu.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={editItem.label} onChange={e => setEditItem({ ...editItem, label: e.target.value })} placeholder="Ad" />
                        <Input value={editItem.url || ""} onChange={e => setEditItem({ ...editItem, url: e.target.value })} placeholder="URL" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem({ ...editItem, is_active: v })} /><Label className="text-xs">Aktiv</Label>
                        <Input type="number" className="w-20" value={editItem.sort_order} onChange={e => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} />
                        <Button size="sm" onClick={() => updateMut.mutate(editItem)}><Save className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}>Ləğv</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {menu.icon && <Badge variant="outline" className="text-xs">{menu.icon}</Badge>}
                        <span className="font-medium text-sm">{menu.label}</span>
                        {menu.url && <code className="text-xs text-muted-foreground">{menu.url}</code>}
                        {!menu.is_active && <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3" /></Badge>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditItem(menu)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(menu.id); }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Sub-menus */}
              {getChildren(menu.id).length > 0 && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-3">
                  {getChildren(menu.id).map((sub: any) => (
                    <Card key={sub.id} className="group">
                      <CardContent className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{sub.label}</span>
                            {sub.url && <code className="text-xs text-muted-foreground">{sub.url}</code>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditItem(sub)}><Pencil className="w-3 h-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(sub.id); }}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 7. SEO TAB
// ═══════════════════════════════════════════════
const SEOTab = () => {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newSeo, setNewSeo] = useState({ page_path: "/", meta_title: "", meta_description: "", og_image_url: "", og_title: "", og_description: "" });

  const { data: seoItems = [], isLoading } = useQuery({
    queryKey: ["cms_seo"],
    queryFn: async () => { const { data, error } = await supabase.from("cms_seo").select("*").order("page_path"); if (error) throw error; return data; },
  });

  const addMut = useMutation({
    mutationFn: async (item: typeof newSeo) => { const { error } = await supabase.from("cms_seo").insert(item as any); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_seo"] }); setShowAdd(false); setNewSeo({ page_path: "/", meta_title: "", meta_description: "", og_image_url: "", og_title: "", og_description: "" }); toast.success("SEO əlavə edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("cms_seo").update({
        meta_title: item.meta_title, meta_description: item.meta_description, og_image_url: item.og_image_url,
        og_title: item.og_title, og_description: item.og_description, no_index: item.no_index, canonical_url: item.canonical_url,
      } as any).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_seo"] }); setEditItem(null); toast.success("Yeniləndi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_seo").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_seo"] }); toast.success("Silindi"); },
    onError: (e: any) => toast.error(e.message),
  });

  const pageOptions = ["/", "/survey", "/auth", "/dashboard", "/hr-panel", "/analytics", "/manager-actions", "/suggestion-box", "/reports"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Globe className="w-5 h-5" /> SEO İdarəsi</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Səhifə əlavə et</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>SEO parametrləri</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Səhifə yolu</Label>
                <Select value={newSeo.page_path} onValueChange={v => setNewSeo({ ...newSeo, page_path: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{pageOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Meta başlıq (60 simvol)</Label><Input value={newSeo.meta_title} onChange={e => setNewSeo({ ...newSeo, meta_title: e.target.value })} maxLength={60} /><span className="text-xs text-muted-foreground">{newSeo.meta_title.length}/60</span></div>
              <div><Label>Meta təsvir (160 simvol)</Label><Textarea value={newSeo.meta_description} onChange={e => setNewSeo({ ...newSeo, meta_description: e.target.value })} maxLength={160} rows={2} /><span className="text-xs text-muted-foreground">{newSeo.meta_description.length}/160</span></div>
              <div><Label>OG şəkil URL</Label><Input value={newSeo.og_image_url} onChange={e => setNewSeo({ ...newSeo, og_image_url: e.target.value })} placeholder="https://..." /></div>
              <Button onClick={() => addMut.mutate(newSeo)} disabled={!newSeo.page_path || !newSeo.meta_title} className="w-full"><Save className="w-4 h-4 mr-1" /> Saxla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : (seoItems as any[]).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">SEO konfiqurasiya yoxdur.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(seoItems as any[]).map((seo: any) => (
            <Card key={seo.id} className="group">
              <CardContent className="py-3 px-4">
                {editItem?.id === seo.id ? (
                  <div className="space-y-2">
                    <div><Label className="text-xs">Meta başlıq</Label><Input value={editItem.meta_title || ""} onChange={e => setEditItem({ ...editItem, meta_title: e.target.value })} maxLength={60} /></div>
                    <div><Label className="text-xs">Meta təsvir</Label><Textarea value={editItem.meta_description || ""} onChange={e => setEditItem({ ...editItem, meta_description: e.target.value })} maxLength={160} rows={2} /></div>
                    <div><Label className="text-xs">OG şəkil</Label><Input value={editItem.og_image_url || ""} onChange={e => setEditItem({ ...editItem, og_image_url: e.target.value })} /></div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editItem.no_index || false} onCheckedChange={v => setEditItem({ ...editItem, no_index: v })} /><Label className="text-xs">noindex</Label>
                      <Button size="sm" className="ml-auto" onClick={() => updateMut.mutate(editItem)}><Save className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}>Ləğv</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{seo.page_path}</code>
                        {seo.no_index && <Badge variant="destructive" className="text-xs">noindex</Badge>}
                      </div>
                      {seo.meta_title && <p className="text-sm font-medium mt-1">{seo.meta_title}</p>}
                      {seo.meta_description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{seo.meta_description}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditItem(seo)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Silmək?")) deleteMut.mutate(seo.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 8. VERSIONS TAB
// ═══════════════════════════════════════════════
const VersionsTab = () => {
  const qc = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["cms_versions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cms_content_versions").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const restoreVersion = useMutation({
    mutationFn: async (version: any) => {
      const vData = version.version_data;
      if (version.content_table === "cms_content") {
        const { error } = await supabase.from("cms_content").update({ content_value: vData.content_value, is_active: vData.is_active } as any).eq("id", version.content_id);
        if (error) throw error;
      } else if (version.content_table === "cms_faqs") {
        const { error } = await supabase.from("cms_faqs").update({ question: vData.question, answer: vData.answer, is_active: vData.is_active } as any).eq("id", version.content_id);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms_content"] }); qc.invalidateQueries({ queryKey: ["cms_faqs"] }); toast.success("Versiya bərpa edildi"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2"><RotateCcw className="w-5 h-5" /> Versiya Tarixçəsi</h3>
      <p className="text-sm text-muted-foreground">Məzmun dəyişiklikləri avtomatik saxlanılır. İstənilən versiyaya qayıda bilərsiniz.</p>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Yüklənir...</div> : (versions as any[]).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Hələ versiya tarixçəsi yoxdur. Məzmun redaktə edildikdə avtomatik saxlanacaq.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {(versions as any[]).map((v: any) => (
            <Card key={v.id} className="group">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{v.content_table}</Badge>
                      <Badge variant="secondary" className="text-xs">v{v.version_number}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(v.created_at).toLocaleString("az-AZ")}</span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                      {JSON.stringify(v.version_data).slice(0, 100)}...
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 gap-1" onClick={() => { if (confirm("Bu versiyaya qayıtmaq istəyirsiniz?")) restoreVersion.mutate(v); }}>
                    <RotateCcw className="w-3 h-3" /> Bərpa et
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN ADMIN CMS PAGE
// ═══════════════════════════════════════════════
const AdminCMS = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Admin CMS</h1>
                <p className="text-xs text-muted-foreground">Sayt məzmununu idarə edin</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")} className="gap-1 hidden sm:inline-flex">
              <Eye className="w-3.5 h-3.5" /> Sayta bax
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-destructive">
              <LogOut className="w-3.5 h-3.5" /> Çıxış
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="content" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-8 gap-1">
              <TabsTrigger value="content" className="gap-1 text-xs sm:text-sm"><FileText className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Məzmun</span></TabsTrigger>
              <TabsTrigger value="faqs" className="gap-1 text-xs sm:text-sm"><HelpCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">FAQ</span></TabsTrigger>
              <TabsTrigger value="partners" className="gap-1 text-xs sm:text-sm"><Handshake className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Tərəfdaş</span></TabsTrigger>
              <TabsTrigger value="media" className="gap-1 text-xs sm:text-sm"><ImageIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Media</span></TabsTrigger>
              <TabsTrigger value="translations" className="gap-1 text-xs sm:text-sm"><Languages className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Tərcümə</span></TabsTrigger>
              <TabsTrigger value="menus" className="gap-1 text-xs sm:text-sm"><MenuIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Menyu</span></TabsTrigger>
              <TabsTrigger value="seo" className="gap-1 text-xs sm:text-sm"><Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">SEO</span></TabsTrigger>
              <TabsTrigger value="versions" className="gap-1 text-xs sm:text-sm"><RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Versiya</span></TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="faqs"><FAQTab /></TabsContent>
          <TabsContent value="partners"><PartnersTab /></TabsContent>
          <TabsContent value="media"><MediaTab /></TabsContent>
          <TabsContent value="translations"><TranslationsTab /></TabsContent>
          <TabsContent value="menus"><MenuBuilderTab /></TabsContent>
          <TabsContent value="seo"><SEOTab /></TabsContent>
          <TabsContent value="versions"><VersionsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminCMS;
