import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step5PostOperative = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Post-operative Observations</h3>
      <p className="text-sm text-muted-foreground">Clinical findings after surgery</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Visual Acuity (Post-op)</Label>
        <Input placeholder="e.g. 20/30" value={data.postVisualAcuity} onChange={e => onChange({ postVisualAcuity: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Intraocular Pressure (mmHg)</Label>
        <Input type="number" placeholder="e.g. 18" value={data.postIntraocularPressure} onChange={e => onChange({ postIntraocularPressure: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Corneal Edema</Label>
        <Select value={data.cornealEdema} onValueChange={v => onChange({ cornealEdema: v })}>
          <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="mild">Mild</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Anterior Chamber Reaction</Label>
        <Select value={data.anteriorChamberReaction} onValueChange={v => onChange({ anteriorChamberReaction: v })}>
          <SelectTrigger><SelectValue placeholder="Select reaction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="mild">Mild (Trace cells)</SelectItem>
            <SelectItem value="moderate">Moderate (1-2+ cells)</SelectItem>
            <SelectItem value="severe">Severe (3-4+ cells / Hypopyon)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Wound Integrity</Label>
        <Select value={data.woundIntegrity} onValueChange={v => onChange({ woundIntegrity: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="intact">Intact — Well sealed</SelectItem>
            <SelectItem value="seidel_negative">Seidel Negative — No leak</SelectItem>
            <SelectItem value="compromised">Compromised — Signs of leak</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Pain Level ({data.painLevel || "0"}/10)</Label>
        <Slider
          min={0}
          max={10}
          step={1}
          value={[parseInt(data.painLevel) || 0]}
          onValueChange={v => onChange({ painLevel: String(v[0]) })}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No pain</span>
          <span>Severe</span>
        </div>
      </div>
    </div>
  </div>
);

export default Step5PostOperative;
