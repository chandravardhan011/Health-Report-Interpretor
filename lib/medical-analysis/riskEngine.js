/**
 * Health Risk Analysis Engine & Clinical Synthesizer
 * Calm, non-panic language. 4 visible categories + internal kidney/liver for overall score.
 */

export function calculateHealthRisks(biomarkers, patient = {}) {
  const bioMap = {};
  biomarkers.forEach(b => {
    bioMap[b.id] = b;
  });

  // 1. Cardiovascular Health (0 - 100, displayed)
  let cardioScore = 15;
  const cardioFactors = [];

  const ldl = bioMap['LDL_CHOLESTEROL']?.value;
  const tc = bioMap['TOTAL_CHOLESTEROL']?.value;
  const hdl = bioMap['HDL_CHOLESTEROL']?.value;
  const tg = bioMap['TRIGLYCERIDES']?.value;
  const cholRatio = bioMap['CHOL_HDL_RATIO']?.value;

  if (ldl) {
    if (ldl >= 160) { cardioScore += 35; cardioFactors.push('LDL cholesterol is quite high — discuss with your doctor'); }
    else if (ldl >= 130) { cardioScore += 20; cardioFactors.push('LDL cholesterol is above the recommended range'); }
    else if (ldl >= 100) { cardioScore += 10; cardioFactors.push('LDL cholesterol is at the borderline level'); }
  }

  if (tc) {
    if (tc >= 240) { cardioScore += 20; cardioFactors.push('Total cholesterol is higher than recommended'); }
    else if (tc >= 200) { cardioScore += 10; cardioFactors.push('Total cholesterol is at the borderline level'); }
  }

  if (hdl) {
    if (hdl < 40) { cardioScore += 20; cardioFactors.push('Protective HDL cholesterol is low'); }
    else if (hdl >= 60) { cardioScore -= 10; cardioFactors.push('HDL (good cholesterol) is at a healthy level'); }
  }

  if (tg) {
    if (tg >= 200) { cardioScore += 15; cardioFactors.push('Triglycerides are elevated'); }
    else if (tg >= 150) { cardioScore += 8; cardioFactors.push('Triglycerides are at the borderline level'); }
  }

  if (cholRatio && cholRatio > 5.0) {
    cardioScore += 15;
    cardioFactors.push('Cholesterol-to-HDL ratio needs attention');
  }

  cardioScore = Math.min(Math.max(cardioScore, 5), 98);

  // 2. Diabetes Risk Assessment (0 - 100, displayed)
  let metabolicScore = 12;
  const metabolicFactors = [];

  const hba1c = bioMap['HBA1C']?.value;
  const fbs = bioMap['FASTING_GLUCOSE']?.value;

  if (hba1c) {
    if (hba1c >= 8.0) { metabolicScore += 65; metabolicFactors.push(`HbA1c is ${hba1c}% — blood sugar has been high for a while, please see your doctor`); }
    else if (hba1c >= 6.5) { metabolicScore += 50; metabolicFactors.push(`HbA1c is ${hba1c}% — in the diabetes range, your doctor can help manage this`); }
    else if (hba1c >= 5.7) { metabolicScore += 25; metabolicFactors.push(`HbA1c is ${hba1c}% — in the pre-diabetes range, worth discussing with your doctor`); }
    else { metabolicFactors.push('HbA1c is in the healthy blood sugar range'); }
  }

  if (fbs) {
    if (fbs >= 126) { metabolicScore += 35; metabolicFactors.push(`Fasting blood sugar (${fbs} mg/dL) is above normal — please consult your doctor`); }
    else if (fbs >= 100) { metabolicScore += 18; metabolicFactors.push(`Fasting blood sugar (${fbs} mg/dL) is slightly elevated`); }
  }

  if (tg && tg >= 200) {
    metabolicScore += 10;
    metabolicFactors.push('Elevated triglycerides are associated with insulin sensitivity');
  }

  metabolicScore = Math.min(Math.max(metabolicScore, 5), 98);

  // 3. Kidney Function (internal only — contributes to overall score, not shown as card)
  let kidneyScore = 10;
  const kidneyFactors = [];

  const egfr = bioMap['EGFR']?.value;
  const creat = bioMap['SERUM_CREATININE']?.value;
  const bun = bioMap['BUN']?.value;
  const uric = bioMap['URIC_ACID']?.value;

  if (egfr) {
    if (egfr < 30) { kidneyScore += 70; kidneyFactors.push('Kidney filtration rate is significantly reduced'); }
    else if (egfr < 60) { kidneyScore += 45; kidneyFactors.push('Kidney filtration rate is moderately reduced'); }
    else if (egfr < 90) { kidneyScore += 15; kidneyFactors.push('Kidney filtration rate is mildly reduced'); }
    else { kidneyFactors.push('Kidney filtration rate is healthy'); }
  }

  if (creat) {
    if (creat >= 2.0) { kidneyScore += 35; kidneyFactors.push('Creatinine is elevated — kidney function needs attention'); }
    else if (creat > 1.2) { kidneyScore += 20; kidneyFactors.push('Creatinine is slightly above normal'); }
  }

  if (bun && bun > 20) {
    kidneyScore += 12;
    kidneyFactors.push('Blood Urea Nitrogen (BUN) is elevated');
  }

  if (uric && uric > 7.2) {
    kidneyScore += 10;
    kidneyFactors.push('Uric acid is elevated');
  }

  kidneyScore = Math.min(Math.max(kidneyScore, 5), 98);

  // 4. Liver Function (internal only — contributes to overall score, not shown as card)
  let liverScore = 10;
  const liverFactors = [];

  const alt = bioMap['ALT']?.value;
  const ast = bioMap['AST']?.value;
  const bili = bioMap['TOTAL_BILIRUBIN']?.value;
  const alp = bioMap['ALKALINE_PHOSPHATASE']?.value;
  const alb = bioMap['ALBUMIN']?.value;

  if (alt) {
    if (alt >= 100) { liverScore += 45; liverFactors.push('ALT enzyme is significantly elevated — liver needs attention'); }
    else if (alt > 45) { liverScore += 25; liverFactors.push('ALT liver enzyme is slightly elevated'); }
  }

  if (ast) {
    if (ast >= 100) { liverScore += 30; liverFactors.push('AST enzyme is significantly elevated'); }
    else if (ast > 40) { liverScore += 18; liverFactors.push('AST liver enzyme is slightly elevated'); }
  }

  if (bili && bili > 1.2) {
    liverScore += 20;
    liverFactors.push('Total bilirubin is elevated');
  }

  if (alp && alp > 147) {
    liverScore += 15;
    liverFactors.push('Alkaline phosphatase is elevated');
  }

  if (alb && alb < 3.5) {
    liverScore += 20;
    liverFactors.push('Serum albumin is low');
  }

  liverScore = Math.min(Math.max(liverScore, 5), 98);

  // 5. Anemia Detection (0 - 100, displayed)
  let anemiaScore = 10;
  const anemiaFactors = [];

  const hb = bioMap['HEMOGLOBIN']?.value;
  const hbStatus = bioMap['HEMOGLOBIN']?.status;
  const mcv = bioMap['MCV']?.value;
  const mcvStatus = bioMap['MCV']?.status;
  const ferritin = bioMap['SERUM_FERRITIN']?.value;
  const ferritinStatus = bioMap['SERUM_FERRITIN']?.status;
  const wbc = bioMap['WBC_COUNT']?.value;
  const wbcStatus = bioMap['WBC_COUNT']?.status;
  const plt = bioMap['PLATELET_COUNT']?.value;
  const plateletStatus = bioMap['PLATELET_COUNT']?.status;

  if (hb) {
    if (hb < 10.0) { anemiaScore += 60; anemiaFactors.push(`Hemoglobin is ${hb} g/dL — low enough to need a doctor's review`); }
    else if (hb < 12.0 || hbStatus === 'LOW') { anemiaScore += 35; anemiaFactors.push(`Hemoglobin is ${hb} g/dL — below the report's reference range, worth discussing with your doctor`); }
    else if (hbStatus === 'NORMAL') { anemiaFactors.push('Hemoglobin is in the healthy range'); }
  }

  if (ferritin && (ferritin < 15 || ferritinStatus === 'LOW')) {
    anemiaScore += 30;
    anemiaFactors.push('Iron stores (ferritin) are low');
  }

  if (mcv) {
    if (mcv < 80 || mcvStatus === 'LOW') { anemiaScore += 15; anemiaFactors.push('Red blood cells are smaller than normal (may indicate iron deficiency)'); }
    else if (mcv > 100 || mcvStatus === 'HIGH') { anemiaScore += 15; anemiaFactors.push('Red blood cells are larger than normal (may indicate B12 or folate needs)'); }
  }

  if (wbc) {
    if (wbc > 11000 || wbcStatus === 'HIGH') { anemiaScore += 15; anemiaFactors.push('White blood cell count is elevated — may indicate infection or inflammation'); }
    else if (wbc < 4000 || wbcStatus === 'LOW') { anemiaScore += 20; anemiaFactors.push('White blood cell count is low — worth discussing immunity with your doctor'); }
  }

  if (plt && (plt < 150 || plateletStatus === 'LOW')) {
    anemiaScore += 20;
    anemiaFactors.push('Platelet count is low — your doctor can review this');
  }

  anemiaScore = Math.min(Math.max(anemiaScore, 5), 98);

  // Overall Wellness Score (100 = excellent, reduced by risk scores)
  const maxRisk = Math.max(cardioScore, metabolicScore, kidneyScore, liverScore, anemiaScore);
  const avgRisk = (cardioScore + metabolicScore + kidneyScore + liverScore + anemiaScore) / 5;
  const penalty = (maxRisk * 0.6) + (avgRisk * 0.4);
  const overallIndex = Math.max(Math.round(100 - penalty + 10), 15);

  // Overall status label
  let overallUrgency = 'optimal';
  if (overallIndex < 40 || maxRisk >= 70) {
    overallUrgency = 'critical';
  } else if (overallIndex < 60 || maxRisk >= 50) {
    overallUrgency = 'high';
  } else if (overallIndex < 75 || maxRisk >= 35) {
    overallUrgency = 'moderate';
  } else if (overallIndex < 88) {
    overallUrgency = 'low';
  }

  const wellnessScore = overallIndex;

  const doctorQuestions = generateDoctorQuestions(biomarkers, {
    cardioScore, metabolicScore, kidneyScore, liverScore, anemiaScore
  });

  const lifestyleRecommendations = generateLifestyleRecommendations(biomarkers, {
    cardioScore, metabolicScore, kidneyScore, liverScore, anemiaScore
  });

  const clinicalSummary = generateClinicalSummary(overallUrgency, overallIndex, {
    cardioScore, metabolicScore, kidneyScore, liverScore, anemiaScore
  }, biomarkers);

  return {
    overallIndex,
    overallUrgency,
    clinicalSummary,
    risks: {
      cardio:    { score: cardioScore,    factors: cardioFactors },
      metabolic: { score: metabolicScore, factors: metabolicFactors },
      kidney:    { score: kidneyScore,    factors: kidneyFactors },
      liver:     { score: liverScore,     factors: liverFactors },
      anemia:    { score: anemiaScore,    factors: anemiaFactors },
      wellness:  { score: wellnessScore,  factors: [] }
    },
    doctorQuestions,
    lifestyleRecommendations
  };
}

function generateClinicalSummary(urgency, score, riskScores, biomarkers) {
  const abnormalCount = biomarkers.filter(b => b.status !== 'NORMAL').length;

  if (urgency === 'optimal') {
    return 'Great news — your biomarkers look well-balanced overall! Cholesterol, blood sugar, and blood count values are all within healthy ranges. Keep up your wellness habits and schedule a routine check-up as your doctor recommends.';
  }

  const primaryConcerns = [];
  if (riskScores.cardioScore >= 40) primaryConcerns.push('cholesterol or heart health markers');
  if (riskScores.metabolicScore >= 40) primaryConcerns.push('blood sugar or diabetes-related markers');
  if (riskScores.kidneyScore >= 40) primaryConcerns.push('kidney function markers');
  if (riskScores.liverScore >= 40) primaryConcerns.push('liver enzyme markers');
  if (riskScores.anemiaScore >= 40) primaryConcerns.push('blood count or iron-related markers');

  const concernsText = primaryConcerns.length > 0
    ? `The main areas to review with your doctor are: ${primaryConcerns.join(', ')}.`
    : 'A few values are outside the typical range.';

  if (urgency === 'critical') {
    return `This report shows ${abnormalCount} value(s) outside the normal range that need attention soon. ${concernsText} Please schedule a visit with your doctor to review these results — they will be able to explain what steps make sense for you.`;
  }

  return `This report shows ${abnormalCount} value(s) that are outside the typical range. ${concernsText} Sharing this report with your doctor is a good next step — they can provide personalized guidance.`;
}

function generateDoctorQuestions(biomarkers, riskScores) {
  const questions = [];

  if (riskScores.cardioScore >= 40) {
    questions.push({
      topic: 'Heart Health & Cholesterol',
      question: 'My cholesterol or lipid levels are higher than normal. What lifestyle changes or treatments would you recommend, and how soon should I retest?',
      rationale: 'Helps you understand whether diet changes, medication, or further testing are needed.'
    });
    questions.push({
      topic: 'Cardiovascular Checks',
      question: 'Are there any additional heart health tests that might be useful given my lipid results?',
      rationale: 'Gives your doctor the chance to recommend further evaluation if appropriate.'
    });
  }

  if (riskScores.metabolicScore >= 40) {
    questions.push({
      topic: 'Blood Sugar Management',
      question: 'My blood sugar or HbA1c is elevated. What target should I aim for, and what changes would help me get there?',
      rationale: 'Sets clear goals and a plan for managing blood sugar levels.'
    });
    questions.push({
      topic: 'Diabetes Follow-up',
      question: 'Are there any routine follow-up tests or screenings I should have regularly given my blood sugar results?',
      rationale: 'Helps you stay on top of diabetes management proactively.'
    });
  }

  if (riskScores.kidneyScore >= 35) {
    questions.push({
      topic: 'Kidney Function',
      question: 'My kidney markers are outside the normal range. Could this be related to dehydration or medications, and should we recheck?',
      rationale: 'Helps distinguish a temporary change from something that needs ongoing monitoring.'
    });
  }

  if (riskScores.liverScore >= 35) {
    questions.push({
      topic: 'Liver Enzymes',
      question: 'My liver enzyme levels are elevated. What might be causing this, and what should I watch out for?',
      rationale: 'Guides the next appropriate steps for liver health evaluation.'
    });
  }

  if (riskScores.anemiaScore >= 35) {
    questions.push({
      topic: 'Blood Count & Iron',
      question: 'My hemoglobin or iron levels are low. What is the best way to address this — through diet, supplements, or other treatment?',
      rationale: 'Helps identify the right approach to improving iron and blood health.'
    });
  }

  if (questions.length === 0) {
    questions.push({
      topic: 'Routine Wellness',
      question: 'My current results look healthy. What routine checks or timeline would you recommend for my age and lifestyle?',
      rationale: 'Helps you stay proactive about your health even when things look good.'
    });
  }

  return questions;
}

function generateLifestyleRecommendations(biomarkers, riskScores) {
  const recs = [];

  if (riskScores.cardioScore >= 35) {
    recs.push({
      category: 'Heart-Healthy Eating',
      icon: 'Heart',
      advice: 'Try a diet rich in fruits, vegetables, whole grains, and healthy fats (like olive oil, nuts, and avocados). Reducing saturated fats from fried foods and fatty meats can help improve cholesterol levels over time.'
    });
    recs.push({
      category: 'Regular Physical Activity',
      icon: 'Activity',
      advice: 'Aim for at least 30 minutes of moderate activity (brisk walking, cycling, or swimming) most days. Regular aerobic exercise helps raise protective HDL cholesterol and supports heart health.'
    });
  }

  if (riskScores.metabolicScore >= 35) {
    recs.push({
      category: 'Blood Sugar–Friendly Diet',
      icon: 'Apple',
      advice: 'Choose whole foods over refined carbohydrates and sugary drinks. Pairing carbohydrates with protein or fiber (vegetables, legumes) helps keep blood sugar levels steadier throughout the day.'
    });
    recs.push({
      category: 'Strength & Movement',
      icon: 'Dumbbell',
      advice: 'Adding light strength training or resistance exercises 2–3 times per week can help your body use blood sugar more efficiently. Even regular walking after meals has a positive effect.'
    });
  }

  if (riskScores.kidneyScore >= 30) {
    recs.push({
      category: 'Hydration & Kidney Care',
      icon: 'Droplet',
      advice: 'Staying well hydrated supports kidney function. Try to limit very salty or processed foods. Avoid taking pain relievers (like ibuprofen) regularly without doctor advice, as they can affect kidneys over time.'
    });
  }

  if (riskScores.liverScore >= 30) {
    recs.push({
      category: 'Supporting Liver Health',
      icon: 'Shield',
      advice: 'Limiting or avoiding alcohol, cutting down on sugary and ultra-processed foods, and maintaining a healthy weight all support liver health. Be cautious with herbal supplements not approved by your doctor.'
    });
  }

  if (riskScores.anemiaScore >= 30) {
    recs.push({
      category: 'Iron & Healthy Blood',
      icon: 'Zap',
      advice: 'Iron-rich foods like spinach, lentils, beans, and lean meat are helpful. Eating them with Vitamin C sources (orange juice, tomatoes, lemon) increases absorption. Try to avoid tea or coffee immediately after iron-rich meals.'
    });
  }

  if (recs.length === 0) {
    recs.push({
      category: 'Maintaining Your Good Health',
      icon: 'Sparkles',
      advice: 'Your results look balanced — keep it up! A varied diet with colorful vegetables and fruits, regular physical activity, good sleep (7–8 hours), and stress management will help you stay in great shape.'
    });
  }

  return recs;
}
