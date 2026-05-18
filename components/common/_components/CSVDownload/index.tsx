import { json2csv } from "json-2-csv";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../../ui/button";

interface CSVDownloadProps {
  data: any[];
  fileName?: string;
  label?: string;
}

const CSVDownloadButton = ({
  data,
  fileName = "Favorite_Athletes",
  label = "Export Report",
}: CSVDownloadProps) => {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Mapping with Styled Column Headings (Keys become headers)
      const csvData = data.map((item) => ({
        "Athlete Name": item.name || "N/A",
        Sport: item.sport?.name || item.sport_name || "N/A",
        Country: item.country?.name || item.country_name || "N/A",
        Status: item.active ? "Active" : "Inactive",
        // This formula allows Google Sheets to render the image automatically
        "Profile Image":
          item.picture || item.img
            ? `=IMAGE("${item.picture || item.img}")`
            : "No Image",
      }));

      const csv = json2csv(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `${fileName}_${new Date().toLocaleDateString()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exported with images successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
    >
      <Download className="h-4 w-4" />
      <span className="font-semibold">{label}</span>
    </Button>
  );
};

export default CSVDownloadButton;
