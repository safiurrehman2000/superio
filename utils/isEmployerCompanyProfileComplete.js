export function isEmployerCompanyProfileComplete(userData) {
  if (!userData || userData.userType !== 'Employer') {
    return false;
  }
  const name = String(userData.company_name ?? '').trim();
  const phone = String(userData.phone ?? userData.phone_number ?? '').trim();
  const location = userData.company_location;
  const hasLocation =
    typeof location === 'string'
      ? location.trim().length > 0
      : location != null && String(location).trim().length > 0;
  const desc = String(userData.description ?? '').trim();
  const ct = userData.company_type;
  const hasCompanyType = Array.isArray(ct)
    ? ct.length > 0
    : ct != null && String(ct).trim().length > 0;

  return !!(name && phone && hasLocation && hasCompanyType && desc);
}
