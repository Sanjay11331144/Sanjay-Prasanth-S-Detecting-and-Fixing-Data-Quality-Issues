import { useState, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileUpload } from "@/components/FileUpload";
import { DashboardView } from "@/components/DashboardView";
import { ProfilingView } from "@/components/ProfilingView";
import { IssuesView } from "@/components/IssuesView";
import { RemediationView } from "@/components/RemediationView";
import { DownloadView } from "@/components/DownloadView";
import { parseFile, analyzeDataset, DatasetInfo } from "@/lib/dataProcessing";
import { toast } from "sonner";

export default function Index() {
  const [view, setView] = useState("upload");
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const data = await parseFile(file);
      const result = analyzeDataset(data);
      setInfo(result);
      setFileName(file.name);
      setView("dashboard");
      toast.success(`Loaded ${file.name}`, { description: `${result.rows} rows, ${result.columns} columns, ${result.issues.length} issues found` });
    } catch (e) {
      toast.error("Failed to parse file", { description: String(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  const renderView = () => {
    if (!info && view !== "upload") return <FileUpload onFileLoaded={handleFile} loading={loading} />;
    switch (view) {
      case "dashboard": return info ? <DashboardView info={info} /> : null;
      case "profiling": return info ? <ProfilingView info={info} /> : null;
      case "issues": return info ? <IssuesView issues={info.issues} /> : null;
      case "remediation": return info ? <RemediationView info={info} onUpdate={setInfo} /> : null;
      case "download": return info ? <DownloadView info={info} fileName={fileName} /> : null;
      default: return <FileUpload onFileLoaded={handleFile} loading={loading} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar active={view} onNavigate={setView} hasData={!!info} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b px-4 bg-card">
            <SidebarTrigger />
            <h1 className="font-bold text-sm tracking-tight truncate">Data Quality Monitor</h1>
            {info && (
              <span className="ml-auto text-xs text-muted-foreground font-mono truncate">{fileName}</span>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
