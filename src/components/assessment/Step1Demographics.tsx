import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssessmentData } from "@/types/assessment";

type Props = { data: AssessmentData; onChange: (d: Partial<AssessmentData>) => void };

const Step1Demographics = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Patient Demographics</h3>
      <p className="text-sm text-muted-foreground">Basic patient identification information</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Patient ID</Label>
        <Input placeholder="e.g. P-2024-0156" value={data.patientId} onChange={e => onChange({ patientId: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input placeholder="Patient full name" value={data.fullName} onChange={e => onChange({ fullName: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Age</Label>
        <Input type="number" placeholder="Age" value={data.age} onChange={e => onChange({ age: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={data.gender} onValueChange={v => onChange({ gender: v })}>
          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Contact Number</Label>
        <Input placeholder="Phone number" value={data.contactNumber} onChange={e => onChange({ contactNumber: e.target.value })} />
      </div>
    </div>
  </div>
);

export default Step1Demographics;
