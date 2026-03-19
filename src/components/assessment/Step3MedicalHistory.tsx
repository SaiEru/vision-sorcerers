import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step3MedicalHistory = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Medical History</h3>
      <p className="text-sm text-muted-foreground">Relevant medical conditions and medications</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>Diabetes Status</Label>
        <Select value={data.diabetes} onValueChange={v => onChange({ diabetes: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Diabetes</SelectItem>
            <SelectItem value="controlled">Controlled Diabetes</SelectItem>
            <SelectItem value="poorly_controlled">Poorly Controlled Diabetes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Checkbox checked={data.hypertension} onCheckedChange={v => onChange({ hypertension: !!v })} id="hypertension" />
        <Label htmlFor="hypertension" className="cursor-pointer">Hypertension</Label>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Checkbox checked={data.immunocompromised} onCheckedChange={v => onChange({ immunocompromised: !!v })} id="immuno" />
        <Label htmlFor="immuno" className="cursor-pointer">Immunocompromised</Label>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border p-3 sm:col-span-2">
        <Checkbox checked={data.previousEyeSurgery} onCheckedChange={v => onChange({ previousEyeSurgery: !!v })} id="prevSurgery" />
        <Label htmlFor="prevSurgery" className="cursor-pointer">Previous Eye Surgery</Label>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Known Allergies</Label>
        <Input placeholder="List any allergies" value={data.allergies} onChange={e => onChange({ allergies: e.target.value })} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Current Medications</Label>
        <Textarea placeholder="List current medications" value={data.currentMedications} onChange={e => onChange({ currentMedications: e.target.value })} />
      </div>
    </div>
  </div>
);

export default Step3MedicalHistory;
