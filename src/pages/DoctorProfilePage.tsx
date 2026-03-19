import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/supabaseDb";
import { useState } from "react";
import { Stethoscope, Mail, Phone, Hash, Shield, Calendar, MapPin, GraduationCap, Clock, Building, FileText, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const DoctorProfilePage = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    license_number: "",
    date_of_birth: "",
    address: "",
    qualification: "",
    experience_years: "",
    department: "",
    bio: "",
  });

  if (!profile) return null;

  const startEdit = async () => {
    // Fetch fresh profile data including new columns
    const { data } = await supabase.from("profiles").select("*").eq("id", profile.id).single();
    const d = data as any;
    setForm({
      full_name: d?.full_name || "",
      phone: d?.phone || "",
      specialization: d?.specialization || "",
      license_number: d?.license_number || "",
      date_of_birth: d?.date_of_birth || "",
      address: d?.address || "",
      qualification: d?.qualification || "",
      experience_years: d?.experience_years?.toString() || "",
      department: d?.department || "",
      bio: d?.bio || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      specialization: form.specialization,
      license_number: form.license_number,
      date_of_birth: form.date_of_birth || null,
      address: form.address,
      qualification: form.qualification,
      experience_years: form.experience_years ? parseInt(form.experience_years) : null,
      department: form.department,
      bio: form.bio,
    } as any).eq("id", profile.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      setEditing(false);
      // Reload page to refresh profile context
      window.location.reload();
    }
  };

  const displayFields = [
    { label: "Full Name", value: profile.full_name, icon: Stethoscope },
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Phone", value: profile.phone || "Not set", icon: Phone },
    { label: "Specialization", value: profile.specialization || "Not set", icon: Shield },
    { label: "License Number", value: profile.license_number || "Not set", icon: Hash },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.full_name || "Doctor"}</h1>
              <p className="text-muted-foreground">{profile.specialization || "Doctor"}</p>
            </div>
          </div>
          {!editing && (
            <Button onClick={startEdit} variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>

        {editing ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              </div>
              <div>
                <Label>License Number</Label>
                <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ophthalmology" />
              </div>
              <div>
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MS" />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="5" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short professional bio..." rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Profile Details</h2>
            <div className="space-y-5">
              {displayFields.map((f) => (
                <div key={f.label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-medium text-foreground">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
