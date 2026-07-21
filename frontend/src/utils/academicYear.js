// Assumes IIEST student emails start with 4 digits for the admission year
// (e.g. "2023xxx001@students.iiests.ac.in") — confirmed by Nirupam.
export function getAcademicYear(email, stream) {
  if (!email || typeof email !== "string") return "";

  const yearMatch = email.match(/^(\d{4})/);
  if (!yearMatch) return "";

  const admissionYear = Number(yearMatch[1]);
  const currentYear = new Date().getFullYear();

  // Reject implausible years (typos, corrupted data) rather than
  // confidently mislabeling someone as "Graduated".
  const EARLIEST_PLAUSIBLE_YEAR = 2015;
  if (admissionYear < EARLIEST_PLAUSIBLE_YEAR || admissionYear > currentYear + 1) {
    return "";
  }

  // Program length depends on stream — without it we don't know whether
  // we're looking at a 4-year or 2-year scale, so don't guess.
  if (!stream) return "";
  if (stream === "PHD") return ""; // no fixed year structure

  const now = new Date();
  // Academic year rolls over after end-sem exams, which wrap up by
  // end of April — so from May onward, someone has "moved up" a year.
  const currentMonth = now.getMonth(); // April = index 3
  const academicYear =
    currentMonth >= 3 ? currentYear - admissionYear + 1 : currentYear - admissionYear;

  if (academicYear <= 0) return "";

  if (stream === "M.Tech") {
    const years = ["1st Year", "2nd Year"];
    if (academicYear > 2) return "Graduated";
    return years[academicYear - 1];
  }

  // B.Tech / B.Arch
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  if (academicYear > 4) return "Graduated";
  return years[academicYear - 1];
}

// Maps a Year to the two semesters that fall inside it, so the Semester
// dropdown only ever shows valid combinations (e.g. "1st Year" can't be
// paired with "5th Sem").
//
// NOTE: the backend's semester enum currently only goes up to "8th Sem"
// (4 years' worth), but YEAR_OPTIONS includes "5th Year" for 5-year
// programs like B.Arch. There's no valid 9th/10th Sem to map to yet — add
// those to the backend enum first if 5th-year students need this. Until
// then, "5th Year" / "Graduated" / no year selected returns null, meaning
// "don't restrict — show every semester."
const YEAR_TO_SEMESTERS = {
  "1st Year": ["1st Sem", "2nd Sem"],
  "2nd Year": ["3rd Sem", "4th Sem"],
  "3rd Year": ["5th Sem", "6th Sem"],
  "4th Year": ["7th Sem", "8th Sem"],
};

// Returns an array of valid semesters for the given year, or null if there's
// no restriction to apply (unset year, "5th Year", or "Graduated").
export function getValidSemesters(year) {
  return YEAR_TO_SEMESTERS[year] || null;
}