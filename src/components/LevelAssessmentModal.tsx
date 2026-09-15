import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, RotateCcw } from "lucide-react";
import type { LevelType } from "./RegistrationForm/types";

interface LevelAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLevel: (level: LevelType) => void;
}

type QuizStep =
  | { type: "question"; index: number }
  | { type: "result"; level: LevelType };

const LevelAssessmentModal = ({
  open,
  onOpenChange,
  onSelectLevel,
}: LevelAssessmentModalProps) => {
  const { t } = useI18n();
  const [step, setStep] = useState<QuizStep>({ type: "question", index: 0 });

  const questions = [
    { text: t.levelQuizQ1, noResult: "A1" as LevelType, yesNext: 1 },
    { text: t.levelQuizQ2, noResult: "A1" as LevelType, yesNext: 2 },
    { text: t.levelQuizQ3, noResult: "A2" as LevelType, yesNext: 3 },
    { text: t.levelQuizQ4, noResult: "B1" as LevelType, yesNext: null },
  ];

  const handleAnswer = useCallback(
    (answer: "yes" | "no") => {
      if (step.type !== "question") return;
      const q = questions[step.index];
      if (!q) return;
      if (answer === "no") {
        setStep({ type: "result", level: q.noResult });
      } else if (q.yesNext !== null) {
        setStep({ type: "question", index: q.yesNext });
      } else {
        setStep({ type: "result", level: "B2" });
      }
    },
    [step, questions]
  );

  const handleReset = useCallback(() => {
    setStep({ type: "question", index: 0 });
  }, []);

  const handleApply = useCallback(() => {
    if (step.type === "result") {
      onSelectLevel(step.level);
      onOpenChange(false);
      // Delay reset so the dialog close animation plays first
      setTimeout(() => setStep({ type: "question", index: 0 }), 300);
    }
  }, [step, onSelectLevel, onOpenChange]);

  const progressPercent =
    step.type === "question"
      ? ((step.index + 1) / questions.length) * 100
      : 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.levelQuizTitle}</DialogTitle>
          <DialogDescription>{t.levelQuizDesc}</DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {step.type === "question" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-base font-medium text-foreground leading-snug">
                {questions[step.index]?.text}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAnswer("yes")}
                className="w-full"
              >
                {t.levelQuizYes}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAnswer("no")}
                className="w-full"
              >
                {t.levelQuizNo}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {step.index + 1} / {questions.length}
            </p>
          </div>
        )}

        {step.type === "result" && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t.levelQuizResultPrefix.split(":")[0]}:
              </p>
              <p className="text-3xl font-bold text-foreground">
                {step.level} 🎉
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleApply} className="w-full sm:w-auto">
                {t.levelQuizApply}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t.levelQuizRestart}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LevelAssessmentModal;
