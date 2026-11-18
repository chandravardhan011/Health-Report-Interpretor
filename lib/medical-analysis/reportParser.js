import { BIOMARKER_DATABASE } from './biomarkers.js';

/**
 * High-Precision Clinical Report Parser.
 * Accurately extracts patient demographics, test results, reference ranges, and units.
 * Prevents alias cross-talk (e.g. 'Cholesterol' matching 'HDL Cholesterol') and
 * correctly separates observed patient results from reference intervals.
 */

// Compile sorted biomarker definitions: longer, more specific names match first
const SORTED_BIOMARKERS = Object.values(BIOMARKER_DATABASE).map(bio => {
  // Sort aliases by length descending so "total cholesterol / hdl ratio" is tested before "cholesterol"
  const sortedAliases = [...bio.aliases].sort((a, b) => b.length - a.length);
  return {
    ...bio,
    sortedAliases
  };
}).sort((a, b) => {
  // Put biomarkers with longer canonical names first
  return b.sortedAliases[0].length - a.sortedAliases[0].length;
});

export function parseMedicalReport(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      patient: null,
      biomarkers: [],
      rawText: ''
    };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Extract Patient Demographics
  const patient = extractPatientDemographics(rawText, lines);

  // 2. Extract Biomarkers
  const detectedBiomarkers = [];
  const handledKeySet = new Set();

  for (const line of lines) {
    if (isHeaderOrSeparator(line)) continue;

    // Try matching candidate biomarkers
    for (const bio of SORTED_BIOMARKERS) {
      if (handledKeySet.has(bio.id)) continue;

      const matchResult = matchBiomarkerInLine(line, bio);
      if (matchResult.matched) {
        handledKeySet.add(bio.id);

        const evaluatedStatus = evaluateBiomarkerStatus(matchResult.value, bio, matchResult.customRange);
        const status = matchResult.reportedStatus
          ? { ...evaluatedStatus, status: matchResult.reportedStatus }
          : evaluatedStatus;

        detectedBiomarkers.push({
          id: bio.id,
          name: bio.name,
          category: bio.category,
          value: matchResult.value,
          unit: matchResult.unit || bio.unit,
          optimalRange: matchResult.customRange || bio.optimalRange,
          status: status.status,
          severity: status.severity,
          pctDeviation: status.pctDeviation,
          description: bio.description,
          clinicalNote: status.status === 'HIGH' || status.status === 'BORDERLINE_HIGH'
            ? bio.highMeaning
            : status.status === 'LOW'
            ? bio.lowMeaning
            : 'Within balanced physiological range.',
          lifestyleTip: bio.lifestyleTip
        });
        break; // matched this line, move to next line
      }
    }
  }

  // 3. Extract Diagnostic & Imaging Findings (e.g. Ultrasound, Radiology notes)
  const diagnosticFindings = extractDiagnosticFindings(rawText, lines);

  return {
    patient,
    biomarkers: detectedBiomarkers,
    diagnosticFindings,
    rawText
  };
}

function extractDiagnosticFindings(rawText, lines) {
  const findings = [];
  let inFindingsSection = false;
  let sectionTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^(?:ULTRASOUND|RADIOLOGY|IMAGING|SONOGRAPHY|MRI|CT\s+SCAN|X-RAY|ECG|FINDINGS|IMPRESSION)\b/i.test(line)) {
      inFindingsSection = true;
      if (!sectionTitle) sectionTitle = line;
      continue;
    }

    if (inFindingsSection) {
      if (/^(?:DEMO\s+SAFETY\s+NOTE|DISCLAIMER|REPORT\s+BY|APPROVED\s+BY|END\s+OF\s+REPORT)/i.test(line)) {
        inFindingsSection = false;
        continue;
      }
      if (/^(?:FINDINGS|OBSERVATIONS|IMPRESSION):?$/i.test(line)) {
        continue;
      }
      if (line.length > 8 && !/^(?:TEST|INVESTIGATION|RESULT|UNIT|REFERENCE)/i.test(line)) {
        findings.push(line.replace(/^[•\-\*]\s*/, '').trim());
      }
    }
  }

  return findings.length > 0 ? { title: sectionTitle || 'Ultrasound & Diagnostic Findings', items: findings } : null;
}

/**
 * Matches a specific biomarker in a line and extracts the exact observed result.
 */
function matchBiomarkerInLine(line, bio) {
  for (const alias of bio.sortedAliases) {
    // Avoid false positives like "Cholesterol" matching "HDL Cholesterol"
    if (alias.toLowerCase() === 'cholesterol' || alias.toLowerCase() === 'chol') {
      if (/\b(?:hdl|ldl|vldl|non-hdl|ratio)\b/i.test(line)) {
        continue; // skip bare cholesterol if line mentions HDL/LDL/Ratio
      }
    }
    if (alias.toLowerCase() === 'hemoglobin' || alias.toLowerCase() === 'hb') {
      if (/\b(?:a1c|glycated|glycosylated)\b/i.test(line)) {
        continue; // skip bare hemoglobin if line is HbA1c
      }
    }
    if (alias.toLowerCase() === 'glucose' || alias.toLowerCase() === 'blood sugar') {
      if (/\b(?:urine|pp|post\s*prandial|random)\b/i.test(line) && !/\bfasting|fbs\b/i.test(line)) {
        // If line is post-prandial or urine, skip fasting glucose
        continue;
      }
    }
    if (alias.toLowerCase() === 'mch' && /\bmchc\b/i.test(line)) {
      continue; // skip MCH if MCHC is present
    }
    if (alias.toLowerCase() === 'bilirubin' && /\bdirect\b/i.test(line)) {
      continue; // skip total bilirubin if line is direct bilirubin
    }

    // Exact word boundary regex for alias
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const aliasRegex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, 'i');
    const match = aliasRegex.exec(line);

    if (match) {
      const aliasIndex = match.index + (match[1] ? match[1].length : 0);
      const afterAlias = line.slice(aliasIndex + alias.length).trim();

      // Extract value and possible range from afterAlias
      const extracted = extractObservedValueAndRange(afterAlias, bio);
      if (extracted.value !== null) {
        return {
          matched: true,
          value: extracted.value,
          unit: extracted.unit,
          customRange: extracted.customRange,
          reportedStatus: extracted.reportedStatus
        };
      }
    }
  }

  return { matched: false };
}

/**
 * Separates reference range expressions from the observed patient value.
 */
function extractObservedValueAndRange(text, bio) {
  let cleaned = text;
  let customRange = null;

  // 1. Detect and isolate two-number reference ranges: e.g. "125 - 200", "4.0 to 5.6", "(70-99)"
  const rangeMatch = cleaned.match(/(?:(?:ref(?:erence)?|normal)?\s*(?:range|interval)?\s*[:=-]?\s*\(?\[?\s*|\b)(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)\s*\)?\]?/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max) && min < max) {
      customRange = [min, max];
      // Remove the range from the text to avoid misinterpreting its numbers as patient values
      cleaned = cleaned.replace(rangeMatch[0], ' ');
    }
  }

  // 2. Detect and remove single-bound inequality ranges: e.g. "< 150", "> 60", "<= 100"
  const ineqMatch = cleaned.match(/(?:[<>]=?|\b(?:less than|greater than)\b)\s*(\d+(?:\.\d+)?)/i);
  if (ineqMatch) {
    // If we have an inequality like "< 150", that's usually the upper reference limit
    cleaned = cleaned.replace(ineqMatch[0], ' ');
  }

  // 3. Remove parenthetical notes that might contain numbers (e.g. "(Standard: 120)")
  cleaned = cleaned.replace(/\([^)a-zA-Z]*\)/g, ' ');

  // 4. Find all remaining numbers in the text
  // Matches floats and integers (e.g. 14.8, 248, 6800, 0.85)
  const numberMatches = [...cleaned.matchAll(/(?:\b|(?<=\s))(\d+(?:[.,]\d+)?)(?:\b|(?=\s))/g)];

  if (numberMatches.length > 0) {
    // The observed value is almost universally the first remaining number after test name!
    const numStr = numberMatches[0][1].replace(',', '.');
    const val = parseFloat(numStr);

    if (!isNaN(val)) {
      const afterValue = cleaned.slice(
        numberMatches[0].index + numberMatches[0][0].length
      );
      const statusMatch = afterValue.match(
        /^\s*(critical\s+(?:high|low)|borderline(?:\s+(?:high|low))?|high|low|normal|h|l)\b/i
      );
      const reportedStatus = statusMatch
        ? statusMatch[1].replace(/\s+/g, '_').toUpperCase()
        : null;
      const normalizedReportedStatus = reportedStatus === 'H'
        ? 'HIGH'
        : reportedStatus === 'L'
          ? 'LOW'
          : reportedStatus;

      // Extract unit if present nearby
      let unit = null;
      if (/\b(?:mg\/dl|mg%)\b/i.test(text)) unit = 'mg/dL';
      else if (/\b(?:g\/dl|gm\/dl|g%)\b/i.test(text)) unit = 'g/dL';
      else if (/\b(?:u\/l|iu\/l)\b/i.test(text)) unit = 'U/L';
      else if (/(?:%|\bpercent\b)/i.test(text) && bio.unit === '%') unit = '%';
      else if (bio.id === 'RBC_COUNT' && /\b(?:million|mill|mil|m)\s*\/\s*(?:ul|cumm|mm3)\b/i.test(text)) unit = 'million/uL';
      else if (/\b(?:cells\/ul|cumm|cells\/mm3)\b/i.test(text)) unit = 'cells/uL';
      else if (/\b(?:million\/ul|m\/ul|mil\/ul)\b/i.test(text)) unit = 'million/uL';
      else if (/\b(?:k\/ul|thou\/ul|10\^3\/ul)\b/i.test(text)) unit = 'k/uL';
      else if (/\b(?:fl)\b/i.test(text)) unit = 'fL';
      else if (/\b(?:pg)\b/i.test(text)) unit = 'pg';
      else if (/\b(?:ng\/ml)\b/i.test(text)) unit = 'ng/mL';
      else if (/\b(?:pg\/ml)\b/i.test(text)) unit = 'pg/mL';
      else if (/\b(?:ml\/min)\b/i.test(text)) unit = 'mL/min';

      // Strict unit safeguard: if biomarker is not canonically measured in %, never assign %!
      if (unit === '%' && bio.unit !== '%') {
        unit = bio.unit;
      }

      // Safeguard for WBC: if value is in thousands (e.g. 7.2) but range is in cells/uL (e.g. 4000-11000) and no custom range
      let normalizedValue = val;
      if (bio.id === 'WBC_COUNT' && val < 50 && (!customRange || customRange[0] > 100)) {
        normalizedValue = val * 1000;
      }

      return {
        value: normalizedValue,
        unit: unit || bio.unit,
        customRange: customRange || bio.optimalRange,
        reportedStatus: normalizedReportedStatus
      };
    }
  }

  return { value: null, unit: null, customRange: null };
}

/**
 * Reassuring, calm evaluation of biomarker deviation (no panic-inducing labels).
 */
function evaluateBiomarkerStatus(value, bio, customRange) {
  const [min, max] = customRange || bio.optimalRange;

  if (value < min) {
    const diffPct = Math.round(((min - value) / min) * 100);
    return {
      status: 'LOW',
      severity: diffPct > 25 ? 'moderate' : 'mild',
      pctDeviation: -diffPct
    };
  }

  if (value > max) {
    const diffPct = Math.round(((value - max) / max) * 100);
    return {
      status: diffPct > 20 ? 'HIGH' : 'BORDERLINE_HIGH',
      severity: diffPct > 20 ? 'moderate' : 'mild',
      pctDeviation: diffPct
    };
  }

  return {
    status: 'NORMAL',
    severity: 'optimal',
    pctDeviation: 0
  };
}

/**
 * Extracts patient demographics from header lines.
 */
function extractPatientDemographics(rawText, lines) {
  const patient = {
    name: 'Patient Record',
    age: 'Not specified',
    gender: 'Not specified',
    patientId: 'GEN-' + Math.floor(100000 + Math.random() * 900000),
    labName: 'Diagnostic Laboratory',
    reportDate: new Date().toISOString().split('T')[0],
    testPanel: 'Comprehensive Lab Report',
    referringDoctor: 'Attending Physician'
  };

  // Lab name from top lines
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    if (/(?:LABORATORY|LAB|DIAGNOSTICS|CLINIC|HOSPITAL|PATHOLOGY|HEALTHCARE|MEDICAL CENTER|INSTITUTE|METROPOLIS|LAL PATH|APOLLO|THYROCARE)/i.test(line)) {
      patient.labName = line.replace(/^[#*=-]+\s*/, '').replace(/\s*[#*=-]+$/, '').trim();
      break;
    }
  }

  // Check for multi-column header lines like "PATIENT REPORT DATE REPORT ID"
  for (let i = 0; i < Math.min(15, lines.length - 1); i++) {
    const headerLine = lines[i];
    const valueLine = lines[i + 1];
    if (/\bPATIENT\b/i.test(headerLine) && /\b(?:REPORT\s*DATE|DATE|REPORT\s*ID|ID)\b/i.test(headerLine)) {
      const idMatch = valueLine.match(/\b([A-Z0-9]+-[0-9A-Z]+)\b/i);
      if (idMatch) {
        patient.patientId = idMatch[1];
      }
      const cleanedVal = valueLine.replace(patient.patientId, '').trim();
      const parts = cleanedVal.split(/\s{2,}|\b(?=DEMO\s+ONLY|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i);
      if (parts[0] && parts[0].trim().length >= 3 && !/^(PATIENT|REPORT|TEST)$/i.test(parts[0].trim())) {
        patient.name = parts[0].trim();
      }
      if (parts[1] && parts[1].trim()) {
        patient.reportDate = parts[1].trim();
      }
      break;
    }
  }

  // Patient Name
  const nameMatch = rawText.match(/(?:PATIENT(?:\s+NAME)?|NAME|PT\.?\s*NAME)\s*[:=-]\s*([A-Za-z\s.]+?)(?=\s{2,}|AGE|GENDER|SEX|DOB|ID|REF|DATE|\n|$)/i);
  if (nameMatch && nameMatch[1].trim() && !/^(MALE|FEMALE|YEARS|YRS|AGE|PATIENT)$/i.test(nameMatch[1].trim())) {
    patient.name = nameMatch[1].trim().replace(/^(MR\.?|MRS\.?|MS\.?|DR\.?)\s+/i, '');
  }

  // Age
  const ageMatch = rawText.match(/(?:AGE|YRS|YEARS)\s*[:=-]?\s*(\d{1,3})(?:\s*(?:YRS|YEARS|Y|M))?/i);
  if (ageMatch) {
    patient.age = parseInt(ageMatch[1], 10) + ' Years';
  }

  // Gender
  const genderMatch = rawText.match(/(?:GENDER|SEX)\s*[:=-]\s*(MALE|FEMALE|M|F|OTHER)/i);
  if (genderMatch) {
    const g = genderMatch[1].toUpperCase();
    patient.gender = (g === 'M' || g === 'MALE') ? 'Male' : (g === 'F' || g === 'FEMALE') ? 'Female' : 'Other';
  }

  // Patient ID / Ref
  const idMatch = rawText.match(/(?:PATIENT\s*ID|UHID|MRN|REF(?:ERENCE)?\s*(?:NO|ID)?|BILL\s*NO|SAMPLE\s*ID)\s*[:=-]\s*([A-Za-z0-9\-_/]+)/i);
  if (idMatch && idMatch[1].trim()) {
    patient.patientId = idMatch[1].trim();
  }

  // Date
  const dateMatch = rawText.match(/(?:COLLECTION\s*DATE|COLLECTED|REPORT\s*DATE|DATE)\s*[:=-]\s*([A-Za-z0-9\s/-]+?)(?=\s{2,}|\n|TIME|$)/i);
  if (dateMatch && dateMatch[1].trim()) {
    patient.reportDate = dateMatch[1].trim();
  }

  // Doctor
  const docMatch = rawText.match(/(?:REF(?:ERRED)?\s*BY|DOCTOR|DR\.?|CONSULTANT)\s*[:=-]\s*([A-Za-z\s.]+?)(?=\s{2,}|\n|PATIENT|DATE|$)/i);
  if (docMatch && docMatch[1].trim()) {
    patient.referringDoctor = docMatch[1].trim();
  }

  // Test Panel
  const panelMatch = rawText.match(/(?:TEST\s*(?:PANEL|REPORT|DESCRIPTION)|INVESTIGATION|PANEL)\s*[:=-]\s*([A-Za-z0-9\s&/()-]+?)(?=\s{2,}|\n|DATE|PATIENT|$)/i);
  if (panelMatch && panelMatch[1].trim()) {
    patient.testPanel = panelMatch[1].trim();
  }

  return patient;
}

function isHeaderOrSeparator(line) {
  return line.startsWith('---') ||
         line.startsWith('===') ||
         /^TEST\s+(?:NAME|DESCRIPTION)\s+.*RESULT/i.test(line) ||
         /^INVESTIGATION\s+.*VALUE/i.test(line);
}
