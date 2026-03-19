import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { AssessmentData } from "@/types/assessment";
import { useRef } from "react";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step7FollowUp = ({ data, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Follow-up & Media Upload</h3>
        <p className="text-sm text-muted-foreground">Schedule follow-up and attach post-operative images</p>
      </div>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Follow-up Date</Label>
          <Input type="date" value={data.followUpDate} onChange={e => onChange({ followUpDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Clinician Notes</Label>
          <Textarea
            placeholder="Add any clinical observations or notes..."
            rows={4}
            value={data.clinicianNotes}
            onChange={e => onChange({ clinicianNotes: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Post-operative Image (optional)</Label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {data.mediaUpload ? data.mediaUpload.name : "Click to upload image (JPEG, PNG)"}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={e => onChange({ mediaUpload: e.target.files?.[0] || null })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7FollowUp;
