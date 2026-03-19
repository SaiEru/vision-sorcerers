import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step4PreOperative = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Pre-operative Assessment</h3>
      <p className="text-sm text-muted-foreground">Clinical measurements before surgery</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Visual Acuity (Pre-op)</Label>
        <Input placeholder="e.g. 20/40" value={data.preVisualAcuity} onChange={e => onChange({ preVisualAcuity: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Intraocular Pressure (mmHg)</Label>
        <Input type="number" placeholder="e.g. 16" value={data.intraocularPressure} onChange={e => onChange({ intraocularPressure: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Corneal Condition</Label>
        <Select value={data.cornealCondition} onValueChange={v => onChange({ cornealCondition: v })}>
          <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="mild_opacity">Mild Opacity</SelectItem>
            <SelectItem value="significant_opacity">Significant Opacity</SelectItem>
            <SelectItem value="scarring">Scarring</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lens Status</Label>
        <Select value={data.lensStatus} onValueChange={v => onChange({ lensStatus: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="early_cataract">Early Cataract</SelectItem>
            <SelectItem value="mature_cataract">Mature Cataract</SelectItem>
            <SelectItem value="pseudophakic">Pseudophakic (IOL)</SelectItem>
            <SelectItem value="aphakic">Aphakic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Pupil Dilation</Label>
        <Select value={data.pupilDilation} onValueChange={v => onChange({ pupilDilation: v })}>
          <SelectTrigger><SelectValue placeholder="Select dilation" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="good">Good (&gt;6mm)</SelectItem>
            <SelectItem value="moderate">Moderate (4-6mm)</SelectItem>
            <SelectItem value="poor">Poor (&lt;4mm)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default Step4PreOperative;
