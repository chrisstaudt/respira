/**
 * Format thread metadata for display
 * Combines brand, catalog number, chart, and description into a readable string
 */

interface ThreadMetadata {
  threadBrand: string | null;
  threadCatalogNumber: string | null;
  threadChart: string | null;
  threadDescription: string | null;
}

export function formatThreadMetadata(thread: ThreadMetadata): string {
  // Primary metadata: brand and catalog number
  const primaryMetadata = [
    thread.threadBrand,
    thread.threadCatalogNumber ? `#${thread.threadCatalogNumber}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  // Secondary metadata: chart and description
  // Only show chart if it's different from catalogNumber
  const secondaryMetadata = [
    thread.threadChart && thread.threadChart !== thread.threadCatalogNumber
      ? thread.threadChart
      : null,
    thread.threadDescription,
  ]
    .filter(Boolean)
    .join(" ");

  return [primaryMetadata, secondaryMetadata].filter(Boolean).join(" • ");
}
