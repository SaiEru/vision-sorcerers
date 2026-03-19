import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const symptoms = [
  { key: "blurredVision" as const, label: "Blurred Vision" },
  { key: "eyePain" as const, label: "Eye Pain" },
  { key: "redness" as const, label: "Redness" },
  { key: "discharge" as const, label: "Discharge" },
  { key: "photophobia" as const, label: "Photophobia (Light Sensitivity)" },
  { key: "floaters" as const, label: "Floaters / Flashes" },
];

const Step6Symptoms = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Symptoms & Complaints</h3>
      <p className="text-sm text-muted-foreground">Patient-reported symptoms after surgery</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {symptoms.map(s => (
        <div key={s.key} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Checkbox
            checked={data[s.key]}
            onCheckedChange={v => onChange({ [s.key]: !!v })}
            id={s.key}
          />
          <Label htmlFor={s.key} className="cursor-pointer">{s.label}</Label>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Label>Additional Symptoms or Notes</Label>
      <Textarea
        placeholder="Describe any additional symptoms..."
        value={data.additionalSymptoms}
        onChange={e => onChange({ additionalSymptoms: e.target.value })}
      />
    </div>
  </div>
);

export default Step6Symptoms;
