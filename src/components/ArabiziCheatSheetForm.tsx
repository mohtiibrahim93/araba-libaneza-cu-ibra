import ResourceDownloadForm from "@/components/ResourceDownloadForm";

interface Props {
  /** Which page the lead came from — stored with the lead for attribution. */
  source: string;
}

/**
 * Arabizi cheat-sheet lead magnet — thin wrapper over the shared
 * ResourceDownloadForm so the Arabizi pages keep their original copy.
 */
const ArabiziCheatSheetForm = ({ source }: Props) => (
  <ResourceDownloadForm
    resource="arabizi-cheat-sheet"
    source={source}
    idPrefix="cs"
    fileHref="/arabizi-cheat-sheet.pdf"
    title="Ia cheat-sheet-ul Arabizi (PDF, gratuit)"
    description="Tabelul cifrelor (2, 3, 5, 6, 7, 8, 9), 20 de expresii libaneze esențiale și un mesaj real decodat cuvânt cu cuvânt. Îl primești pe email în câteva secunde."
  />
);

export default ArabiziCheatSheetForm;
