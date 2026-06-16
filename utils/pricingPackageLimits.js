export function extractJobLimitFromPackage(packageData) {
  if (!packageData) return 0;

  if (packageData.jobPosts != null && packageData.jobPosts !== '') {
    const parsed = parseInt(packageData.jobPosts, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  if (packageData.jobLimit != null && packageData.jobLimit !== '') {
    const parsed = parseInt(packageData.jobLimit, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  if (packageData.features && Array.isArray(packageData.features)) {
    for (const feature of packageData.features) {
      const match = String(feature).match(/(\d+)\s+job\s+posting/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }

  const packageType = packageData.packageType?.toLowerCase();
  switch (packageType) {
    case 'basic':
      return 30;
    case 'standard':
      return 40;
    case 'extended':
      return 50;
    default:
      return 0;
  }
}
