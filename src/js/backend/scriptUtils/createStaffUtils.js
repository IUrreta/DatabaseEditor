import { queryDB } from "../dbManager";
import { countries_abreviations, inverted_countries_abreviations } from "./countries.js";

const DRIVER_STAT_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const STAFF_STAT_IDS = {
  1: [0, 1, 14, 15, 16, 17],
  2: [13, 25, 43],
  3: [19, 20, 26, 27, 28, 29, 30, 31],
  4: [11, 22, 23, 24]
};

const STAFF_TYPE_NAMES = {
  0: "Drivers",
  1: "Technical Chiefs",
  2: "Race Engineers",
  3: "H. of Aerodynamics",
  4: "Sporting Directors"
};

export function fetchRandomStaffDraft(typeStaffRaw, gameYear = "24") {
  const typeStaff = normalizeStaffType(typeStaffRaw);
  const nationality = pickRandomNationality(gameYear);
  const gender = randomInt(0, 1);
  const firstNameLocKey = pickRandomForename(gender, nationality.staffNameLocale);
  const lastNameLocKey = pickRandomSurname(nationality.staffNameLocale);
  const firstName = extractNameToken(firstNameLocKey);
  const lastName = extractNameToken(lastNameLocKey);
  const { age, retirementAge } = buildAgeDetails(typeStaff);
  const stats = buildRandomStats(typeStaff);
  const driverCode = typeStaff === 0 ? buildDriverCode(firstName, lastName) : "";
  const driverNumber = typeStaff === 0 ? pickAvailableDriverNumber() : 0;
  const statsArray = (typeStaff === 0)
    ? [...stats.values, stats.improvability, stats.aggression]
    : stats.values;

  return {
    draftId: `draft-${Date.now()}-${randomInt(1000, 9999)}`,
    draft: true,
    typeStaff: String(typeStaff),
    typeName: STAFF_TYPE_NAMES[typeStaff],
    gender,
    firstName,
    lastName,
    firstNameLocKey,
    lastNameLocKey,
    name: `${firstName} ${lastName}`.trim(),
    nationality: nationality.code,
    countryId: nationality.countryId,
    countryName: nationality.name,
    staffNameLocale: nationality.staffNameLocale,
    stats: statsArray.join(" "),
    statsArray,
    age,
    retirement_age: retirementAge,
    marketability: typeStaff === 0 ? stats.marketability : undefined,
    improvability: typeStaff === 0 ? stats.improvability : undefined,
    aggression: typeStaff === 0 ? stats.aggression : undefined,
    driver_number: driverNumber,
    wants1: 0,
    superlicense: typeStaff === 0 ? 1 : 0,
    driver_code: driverCode,
    isRetired: 0,
    race_formula: 4,
    teamid: 0,
    mentality0: gameYear === "24" ? 2 : -1,
    mentality1: gameYear === "24" ? 2 : -1,
    mentality2: gameYear === "24" ? 2 : -1,
    global_mentality: gameYear === "24" ? 59 : -1
  };
}

export function fetchRandomDraftForename(genderRaw, staffNameLocaleRaw) {
  const gender = Number(genderRaw);
  const staffNameLocale = Number(staffNameLocaleRaw);
  const genderText = gender === 1 ? "Female" : "Male";

  const firstNameLocKey = queryDB(`
    SELECT LocKey
    FROM Staff_ForenamePool
    WHERE LocKey LIKE ?
      AND Locale = ?
    ORDER BY RANDOM()
    LIMIT 1
  `, [`%StaffName_Forename_${genderText}_%`, staffNameLocale], "singleValue");

  const lastNameLocKey = pickRandomSurname(staffNameLocale);

  return {
    firstNameLocKey,
    firstName: extractNameToken(firstNameLocKey),
    lastNameLocKey,
    lastName: extractNameToken(lastNameLocKey)
  };
}

export function fetchCountryLocaleForCode(codeRaw) {
  const code = String(codeRaw || "").toUpperCase();
  const nationalityName = inverted_countries_abreviations[code] || "";
  const key = nationalityName.replace(/\s+/g, "");

  const row = queryDB(`
    SELECT CountryID, Name, StaffNameLocale
    FROM Countries
    WHERE Name LIKE ?
    LIMIT 1
  `, [`%[Nationality_${key}]%`], "singleRow");

  return {
    code,
    countryId: row?.[0] ?? null,
    countryName: nationalityName,
    staffNameLocale: row?.[2] ?? null
  };
}

function normalizeStaffType(typeStaffRaw) {
  const typeStaff = Number(typeStaffRaw);
  if (!Number.isInteger(typeStaff) || typeStaff < 0 || typeStaff > 4) {
    throw new Error(`Invalid staff type: ${typeStaffRaw}`);
  }
  return typeStaff;
}

function buildAgeDetails(typeStaff) {
  let minAge = 18;
  let maxAge = 38;
  let minRetirementGap = 4;
  let maxRetirementAge = 46;

  if (typeStaff === 1 || typeStaff === 3 || typeStaff === 4) {
    minAge = 32;
    maxAge = 66;
    minRetirementGap = 5;
    maxRetirementAge = 75;
  } else if (typeStaff === 2) {
    minAge = 24;
    maxAge = 60;
    minRetirementGap = 5;
    maxRetirementAge = 70;
  }

  const age = randomInt(minAge, maxAge);
  const retirementAge = randomInt(age + minRetirementGap, maxRetirementAge);

  return { age, retirementAge };
}

function buildRandomStats(typeStaff) {
  const statIDs = typeStaff === 0 ? DRIVER_STAT_IDS : STAFF_STAT_IDS[typeStaff];
  const base = pickBaseRating(typeStaff);
  const spread = typeStaff === 0 ? 12 : 10;
  const values = statIDs.map(() => statAroundBase(base, spread, { min: 64, max: 100 }));

  return {
    values,
    improvability: typeStaff === 0 ? statAroundBase(base, 22, { min: 0, max: 100 }) : undefined,
    aggression: typeStaff === 0 ? statAroundBase(base, 22, { min: 0, max: 100 }) : undefined,
    marketability: typeStaff === 0 ? statAroundBase(base, 25, { min: 0, max: 100 }) : undefined
  };
}

function pickRandomForename(gender, staffNameLocale = null) {
  const genderText = gender === 1 ? "Female" : "Male";
  const locKey = queryDB(`
    SELECT LocKey
    FROM Staff_ForenamePool
    WHERE LocKey LIKE ?
      AND Locale = ?
    ORDER BY RANDOM()
    LIMIT 1
  `, [`%StaffName_Forename_${genderText}_%`, staffNameLocale], "singleValue");

  if (locKey) return locKey;

  return "[STRING_LITERAL:Value=|New|]";
}

function pickRandomSurname(staffNameLocale = null) {
  const locKey = queryDB(`
    SELECT LocKey
    FROM Staff_SurnamePool
    WHERE LocKey IS NOT NULL
      AND Locale = ?
    ORDER BY RANDOM()
    LIMIT 1
  `, [staffNameLocale], "singleValue");

  if (locKey) return locKey;

  return "[STRING_LITERAL:Value=|Person|]";
}

function pickRandomNationality(gameYear) {
  let year = String(gameYear || "").trim();
  if (year === "2024") year = "24";
  if (year === "2023") year = "23";

  if (year === "24") {
    const row = queryDB(`
      SELECT CountryID, Name, StaffNameLocale
      FROM Countries
      WHERE Name LIKE '%[Nationality_%'
      ORDER BY RANDOM()
      LIMIT 1
    `, [], "singleRow");

    const match = String(row?.[1] || "").match(/(?<=\[Nationality_)[^\]]+/);
    const nationalityName = match ? match[0].replace(/(?<!^)([A-Z])/g, " $1") : "";
    const code = fetchCountryCode(nationalityName);
    return { countryId: row?.[0] ?? null, code, name: nationalityName, staffNameLocale: row?.[2] ?? null };
  }

  const nationalityRaw = queryDB(`
    SELECT Nationality
    FROM Staff_BasicData
    WHERE Nationality IS NOT NULL
      AND Nationality != ''
    ORDER BY RANDOM()
    LIMIT 1
  `, [], "singleValue");

  const nationalityName = String(nationalityRaw || "").replace(/(?<!^)([A-Z])/g, " $1");
  const code = fetchCountryCode(nationalityName);
  return { countryId: null, code, name: nationalityName, staffNameLocale: null };
}

function fetchCountryCode(nationalityName) {
  return countries_abreviations[nationalityName] || "";
}

function pickAvailableDriverNumber() {
  const available = queryDB(`
    SELECT Number
    FROM Staff_DriverNumbers
    WHERE CurrentHolder IS NULL
    ORDER BY RANDOM()
    LIMIT 1
  `, [], "singleValue");

  return available || 0;
}

function buildDriverCode(firstName, lastName) {
  const compact = `${firstName}${lastName}`.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (compact || "NEW").slice(0, 3).padEnd(3, "X");
}

function extractNameToken(value) {
  const stringValue = String(value || "");
  const literalMatch = stringValue.match(/\|([^|]+)\|/);
  if (literalMatch) {
    return literalMatch[1];
  }

  const forenameMatch = stringValue.match(/StaffName_Forename_(?:Male|Female)_(\w+)/);
  if (forenameMatch) {
    return removeTrailingDigits(forenameMatch[1]);
  }

  const surnameMatch = stringValue.match(/Staff(?:Name)?_Surname_(\w+)/);
  if (surnameMatch) {
    return removeTrailingDigits(surnameMatch[1]);
  }

  return "New";
}

function removeTrailingDigits(value) {
  return String(value || "").replace(/\d+$/, "");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function pickBaseRating(typeStaff) {
  const min = 64;
  const max = typeStaff === 0 ? 92 : 90;
  const u = (Math.random() + Math.random()) / 2;
  return clampInt(min + u * (max - min), min, max);
}

function statAroundBase(base, spread, { min, max }) {
  const delta = (Math.random() - Math.random()) * spread;
  return clampInt(base + delta, min, max);
}
