import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CourseType } from "./types";

interface Props {
  courseType: CourseType | "";
  name: string;
  phone: string;
  email: string;
  message: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onMessageChange: (v: string) => void;
}

const LeadFields = ({
  courseType,
  name,
  phone,
  email,
  message,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onMessageChange,
}: Props) => {
  const { t } = useI18n();

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">
            {courseType === "kids" ? t.kidsParentName : t.labelName} *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t.placeholderName}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t.labelPhone} *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={t.placeholderPhone}
            required
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.labelEmail}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t.placeholderEmail}
            maxLength={255}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t.mainLeadMessageLabel}</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t.mainLeadMessagePlaceholder}
          rows={3}
          maxLength={1000}
        />
      </div>
    </>
  );
};

export default LeadFields;