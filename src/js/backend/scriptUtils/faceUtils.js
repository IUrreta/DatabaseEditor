const FACE_COUNTS = {
  Male: {
    0: { 0: 35, 1: 35 },
    1: { 0: 25, 1: 25 },
    2: { 0: 25, 1: 25 },
    3: { 0: 25, 1: 25 },
    4: { 0: 25, 1: 25 }
  },
  Female: {
    0: { 0: 10, 1: 9 },
    1: { 0: 10, 1: 10 },
    2: { 0: 10, 1: 10 },
    3: { 0: 10, 1: 10 },
    4: { 0: 10, 1: 10 }
  }
};

export function getFaceCount(gender, faceType, ageType) {
  return FACE_COUNTS[getFaceGenderFolder(gender)][Number(faceType)][Number(ageType)];
}

export function buildFacePath(gender, faceType, faceIndex, ageType) {
  const genderFolder = getFaceGenderFolder(gender);
  const genderToken = getFaceGenderToken(gender);
  const ageToken = Number(ageType) === 0 ? "Y" : "A";
  const index = String(faceIndex).padStart(3, "0");
  const normalizedFaceType = Number(faceType);
  const fileFaceType = normalizedFaceType === 0 ? "FTO" : `FT${normalizedFaceType}`;

  return `./assets/images/Faces/${genderFolder}/FT${normalizedFaceType}/AI_H_${index}_${ageToken}${genderToken}_${fileFaceType}_premultiplied.png`;
}

export function buildFaceGalleryEntries(gender, faceType, ageType) {
  const totalFaces = getFaceCount(gender, faceType, ageType);
  const gallery = [];

  for (let faceIndex = 1; faceIndex <= totalFaces; faceIndex++) {
    gallery.push({
      faceIndex,
      path: buildFacePath(gender, faceType, faceIndex, ageType)
    });
  }

  return gallery;
}

function getFaceGenderFolder(gender) {
  return Number(gender) === 1 ? "Female" : "Male";
}

function getFaceGenderToken(gender) {
  return Number(gender) === 1 ? "F" : "M";
}
