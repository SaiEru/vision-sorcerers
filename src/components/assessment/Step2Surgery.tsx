import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step2Surgery = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Surgery Information</h3>
      <p className="text-sm text-muted-foreground">Details about the surgical procedure</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Surgery Type</Label>
        <Select value={data.surgeryType} onValueChange={v => onChange({ surgeryType: v })}>
          <SelectTrigger><SelectValue placeholder="Select surgery type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cataract">Cataract</SelectItem>
            <SelectItem value="lasik">LASIK</SelectItem>
            <SelectItem value="glaucoma">Glaucoma</SelectItem>
            <SelectItem value="retinal">Retinal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Surgery Date</Label>
        <Input type="date" value={data.surgeryDate} onChange={e => onChange({ surgeryDate: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Surgeon Name</Label>
        <Input placeholder="Dr. " value={data.surgeonName} onChange={e => onChange({ surgeonName: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Eye Side</Label>
        <Select value={data.eyeSide} onValueChange={v => onChange({ eyeSide: v })}>
          <SelectTrigger><SelectValue placeholder="Select eye" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left Eye (OS)</SelectItem>
            <SelectItem value="right">Right Eye (OD)</SelectItem>
            <SelectItem value="both">Both Eyes (OU)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Anesthesia Type</Label>
        <Select value={data.anesthesiaType} onValueChange={v => onChange({ anesthesiaType: v })}>
          <SelectTrigger><SelectValue placeholder="Select anesthesia" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="topical">Topical</SelectItem>
            <SelectItem value="local">Local (Peribulbar/Retrobulbar)</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default Step2Surgery;
