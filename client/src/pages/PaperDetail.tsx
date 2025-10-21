import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ExternalLink, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { NetworkGraph } from "@/components/NetworkGraph";
import { trpc } from "@/lib/trpc";

interface NetworkNode {
  id: string;
  label: string;
  year?: number;
  citationCount?: number;
  isCenter?: boolean;
}

interface NetworkEdge {
  from: string;
  to: string;
}

interface PaperInfo {
  paperId: string;
  title: string;
  authors: { name: string }[];
  year: number;
  venue: string;
  citationCount: number;
  referenceCount: number;
  abstract: string;
  externalIds: {
    DOI?: string;
    ArXiv?: string;
  };
  url?: string;
}

export default function PaperDetail() {
  const [, params] = useRoute("/paper/:query");
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [networkData, setNetworkData] = useState<{
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  } | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperInfo | null>(null);

  let query = params?.query ? decodeURIComponent(params.query) : "";
  
  // Normalize DOI format - add DOI: prefix if it looks like a DOI
  if (query.match(/^10\.\d{4,}/)) {
    query = `DOI:${query}`;
  }

  // Determine if it's a paper ID or search query
  const isPaperId = query.length === 40 && /^[a-f0-9]+$/.test(query);

  // Fetch paper data
  const { data: paper, isLoading, error } = isPaperId
    ? trpc.paper.getById.useQuery({ id: query }, { enabled: !!query })
    : trpc.paper.search.useQuery({ query }, { enabled: !!query });

  // Fetch references and citations when paper is loaded
  const { data: referencesData } = trpc.paper.getReferences.useQuery(
    { paperId: paper?.paperId || "", limit: 20 },
    { enabled: !!paper?.paperId }
  );

  const { data: citationsData } = trpc.paper.getCitations.useQuery(
    { paperId: paper?.paperId || "", limit: 20 },
    { enabled: !!paper?.paperId }
  );

  // Set selected paper when main paper loads
  useEffect(() => {
    if (paper) {
      setSelectedPaper(paper as PaperInfo);
    }
  }, [paper]);

  // Build network when data is available
  useEffect(() => {
    if (!paper || !referencesData || !citationsData) return;

    const nodes: NetworkNode[] = [
      {
        id: paper.paperId,
        label: paper.title,
        year: paper.year,
        citationCount: paper.citationCount,
        isCenter: true,
      },
    ];

    const edges: NetworkEdge[] = [];

    // Add references (papers this paper cites)
    if (referencesData.data) {
      referencesData.data.forEach((ref: any) => {
        if (ref.citedPaper) {
          nodes.push({
            id: ref.citedPaper.paperId,
            label: ref.citedPaper.title || "タイトルなし",
            year: ref.citedPaper.year,
            citationCount: ref.citedPaper.citationCount,
          });
          edges.push({
            from: paper.paperId,
            to: ref.citedPaper.paperId,
          });
        }
      });
    }

    // Add citations (papers that cite this paper)
    if (citationsData.data) {
      citationsData.data.forEach((cit: any) => {
        if (cit.citingPaper) {
          nodes.push({
            id: cit.citingPaper.paperId,
            label: cit.citingPaper.title || "タイトルなし",
            year: cit.citingPaper.year,
            citationCount: cit.citingPaper.citationCount,
          });
          edges.push({
            from: cit.citingPaper.paperId,
            to: paper.paperId,
          });
        }
      });
    }

    console.log("Setting network data:", { nodeCount: nodes.length, edgeCount: edges.length });
    console.log("Sample nodes:", nodes.slice(0, 3));
    console.log("Sample edges:", edges.slice(0, 3));
    setNetworkData({ nodes, edges });
  }, [paper, referencesData, citationsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">論文を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">論文が見つかりません</h2>
          <p className="text-muted-foreground mb-6">
            {error?.message || "論文の検索に失敗しました"}
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            戻る
          </Button>
        </Card>
      </div>
    );
  }

  const networkLoading = !referencesData || !citationsData;
  const nodes = networkData?.nodes || [];
  const edges = networkData?.edges || [];

  // Calculate year range for color mapping
  const years = nodes.map(n => n.year).filter(y => y !== undefined) as number[];
  const minYear = years.length > 0 ? Math.min(...years) : 2020;
  const maxYear = years.length > 0 ? Math.max(...years) : 2025;

  // Get year color (green for old, blue for new)
  const getYearColor = (year?: number) => {
    if (!year || years.length === 0) return "#6366f1";
    const normalized = (year - minYear) / (maxYear - minYear || 1);
    // Green (old) to Blue (new)
    const r = Math.round(74 + (99 - 74) * normalized);
    const g = Math.round(222 + (102 - 222) * normalized);
    const b = Math.round(128 + (241 - 128) * normalized);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          <h1 className="text-base font-semibold truncate max-w-2xl px-4">
            {paper.title}
          </h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Sidebar - Paper List */}
        <div className="w-64 border-r bg-card overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <div className="mb-4">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Origin paper
              </div>
              <div className="p-3 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {paper.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {paper.authors?.slice(0, 2).map((a: any) => a.name).join(", ")}
                  {paper.authors && paper.authors.length > 2 && "..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {paper.year}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {nodes
                .filter(n => n.id !== paper.paperId)
                .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
                .slice(0, 20)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      const nodePaper = {
                        paperId: node.id,
                        title: node.label,
                        authors: [],
                        year: node.year || 0,
                        venue: "",
                        citationCount: node.citationCount || 0,
                        referenceCount: 0,
                        abstract: "",
                        externalIds: {},
                      };
                      setSelectedPaper(nodePaper);
                    }}
                    className={`w-full text-left p-2 rounded-lg hover:bg-accent transition-colors ${
                      selectedPaper?.paperId === node.id ? "bg-accent" : ""
                    }`}
                  >
                    <h4 className="text-xs font-medium line-clamp-2 mb-1">
                      {node.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {node.year}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Center - Graph */}
        <div className="flex-1 relative bg-background">
          {networkLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">ネットワークを構築中...</p>
              </div>
            </div>
          ) : networkData ? (
            <>
              <NetworkGraph
                nodes={nodes}
                edges={edges}
                centerNodeId={paper.paperId}
                getNodeColor={getYearColor}
                onNodeClick={(nodeId) => {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) {
                    const nodePaper = {
                      paperId: node.id,
                      title: node.label,
                      authors: [],
                      year: node.year || 0,
                      venue: "",
                      citationCount: node.citationCount || 0,
                      referenceCount: 0,
                      abstract: "",
                      externalIds: {},
                    };
                    setSelectedPaper(nodePaper);
                  }
                }}
              />
              
              {/* Year Timeline */}
              {years.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur px-4 py-2 rounded-lg border shadow-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium">{minYear}</span>
                    <div className="w-48 h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <span className="text-xs font-medium">{maxYear}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">ネットワークデータがありません</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Paper Details */}
        <div className="w-96 border-l bg-card overflow-y-auto flex-shrink-0">
          {selectedPaper && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 leading-tight">
                {selectedPaper.title}
              </h2>

              <div className="space-y-4">
                {selectedPaper.authors && selectedPaper.authors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      著者
                    </h3>
                    <p className="text-sm">
                      {selectedPaper.authors.map((a: any) => a.name).join(", ")}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedPaper.year && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        発行年
                      </h3>
                      <p className="text-sm">{selectedPaper.year}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      被引用数
                    </h3>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {selectedPaper.citationCount}
                    </p>
                  </div>
                </div>

                {selectedPaper.venue && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      掲載誌
                    </h3>
                    <p className="text-sm">{selectedPaper.venue}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Open in
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://www.semanticscholar.org/paper/${selectedPaper.paperId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Semantic Scholar
                      </a>
                    </Button>
                    {selectedPaper.externalIds?.DOI && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://doi.org/${selectedPaper.externalIds.DOI}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          DOI
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {selectedPaper.abstract && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      抄録
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedPaper.abstract}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

