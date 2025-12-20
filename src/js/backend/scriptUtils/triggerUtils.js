import { queryDB } from "../dbManager";

const difficultyDict = {
  0: {
    name: "default",
    perc: 0,
    "7and8": 0,
    "9": 0,
    reduction: 0,
    research: 0
  },
  1: {
    name: "reducedWeight",
    perc: 0,
    "7and8": 0,
    "9": 0,
    reduction: 0,
    research: 0
  },
  2: {
    name: "extraHard",
    perc: 0.5,
    "7and8": 0.01,
    "9": 0.005,
    reduction: 0,
    research: 8
  },
  3: {
    name: "brutal",
    perc: 0.8,
    "7and8": 0.016,
    "9": 0.008,
    reduction: 0.05,
    research: 14
  },
  4: {
    name: "unfair",
    perc: 1.5,
    "7and8": 0.03,
    "9": 0.015,
    reduction: 0.11,
    research: 30
  },
  5: {
    name: "insane",
    perc: 2,
    "7and8": 0.04,
    "9": 0.02,
    reduction: 0.16,
    research: 45
  },
  6: {
    name: "impossible",
    perc: 3,
    "7and8": 0.06,
    "9": 0.03,
    reduction: 0.2,
    research: 65
  }
};


const invertedDifficultyDict = Object.fromEntries(
  Object.entries(difficultyDict).map(([key, entry]) => [entry.name, Number(key)])
);

export function manageDifficultyTriggers(triggerList) {
  console.log("Managing difficulty triggers with list:", triggerList);
  if (triggerList.statDif !== undefined) manageDesignBoostTriggers(triggerList.statDif);
  if (triggerList.designTimeDif !== undefined) manageDesignTimeTriggers(triggerList.designTimeDif);
  if (triggerList.lightDif !== undefined) manageWeightTrigger(triggerList.lightDif);
  if (triggerList.buildDif !== undefined) manageInstantBuildTriggers(triggerList.buildDif);
  if (triggerList.researchDif !== undefined) manageResearchTriggers(triggerList.researchDif);
}

export function manageWeightTrigger(triggerLevel) {
  console.log("Managing weight trigger with level:", triggerLevel);
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_normal", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_extreme", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_impossible", [], 'run');
  triggerLevel = parseInt(triggerLevel);
  let triggerSQL = "";
  if (triggerLevel > 0) {
    if (triggerLevel === 1) {
      triggerSQL = `
          CREATE TRIGGER reduced_weight_normal
          AFTER INSERT ON Parts_Designs_StatValues
          FOR EACH ROW
          WHEN (
            SELECT TeamID FROM Parts_Designs WHERE DesignID = NEW.DesignID
          ) != (SELECT TeamID FROM Player)
          AND NEW.PartStat = 15
          BEGIN
            UPDATE Parts_Designs_StatValues
            SET 
              Value = 200,
              unitValue = (
                SELECT CASE PD.PartType
                  WHEN 3 THEN 4340
                  WHEN 4 THEN 1800
                  WHEN 5 THEN 2240
                  WHEN 6 THEN 3300
                  WHEN 7 THEN 2680
                  WHEN 8 THEN 2180
                  ELSE value
                END
                FROM Parts_Designs PD
                WHERE PD.DesignID = NEW.DesignID
              )
            WHERE DesignID = NEW.DesignID
            AND PartStat = 15;
          END;
        `;
    } else if (triggerLevel === 2) {
      triggerSQL = `
          CREATE TRIGGER reduced_weight_impossible
          AFTER INSERT ON Parts_Designs_StatValues
          FOR EACH ROW
          WHEN (
            SELECT TeamID FROM Parts_Designs WHERE DesignID = NEW.DesignID
          ) != (SELECT TeamID FROM Player)
          AND NEW.PartStat = 15
          BEGIN
            UPDATE Parts_Designs_StatValues
            SET 
              Value = 0,
              unitValue = (
                SELECT CASE PD.PartType
                  WHEN 3 THEN 3800
                  WHEN 4 THEN 1250
                  WHEN 5 THEN 1650
                  WHEN 6 THEN 2750
                  WHEN 7 THEN 2100
                  WHEN 8 THEN 1700
                  ELSE value
                END
                FROM Parts_Designs PD
                WHERE PD.DesignID = NEW.DesignID
              )
            WHERE DesignID = NEW.DesignID
            AND PartStat = 15;
          END;
        `;
    }
    if (triggerSQL) queryDB(triggerSQL, [], 'run');
  }
}

export function manageDesignTimeTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS designTime_extraHard", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS designTime_brutal", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS designTime_unfair", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS designTime_insane", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS designTime_impossible", [], 'run');
}

export function manageDesignBoostTriggers(triggerLevel) {
  triggerLevel = parseInt(triggerLevel);
  queryDB("DROP TRIGGER IF EXISTS difficulty_extraHard", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS difficulty_brutal", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS difficulty_unfair", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS difficulty_insane", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS difficulty_impossible", [], 'run');
  let triggerSQL = "";
  if (triggerLevel > 0) {
    const triggerName = `difficulty_${difficultyDict[triggerLevel].name}`;
    const increase_perc = difficultyDict[triggerLevel].perc;
    const increase_7and8 = difficultyDict[triggerLevel]["7and8"];
    const increase_9 = difficultyDict[triggerLevel]["9"];
    triggerSQL = `
        CREATE TRIGGER ${triggerName}
        AFTER INSERT ON Parts_Designs_StatValues
        FOR EACH ROW
        WHEN (
          SELECT TeamID FROM Parts_Designs WHERE DesignID = NEW.DesignID
          AND ValidFrom = (SELECT CurrentSeason FROM Player_State)
        ) != (SELECT TeamID FROM Player)
        AND NEW.PartStat != 15
        BEGIN
          UPDATE Parts_Designs_StatValues
          SET 
            unitValue = CASE
              WHEN NEW.PartStat IN (7, 8) THEN unitValue + ${increase_7and8}
              WHEN NEW.PartStat = 9 THEN unitValue + ${increase_9}
              ELSE unitValue + ${increase_perc}
            END,
            Value = CASE
              WHEN NEW.PartStat IN (0, 1, 2, 3, 4, 5) THEN (unitValue + ${increase_perc}) * 10
              WHEN NEW.PartStat = 6 THEN ((unitValue + ${increase_perc}) - 90) * 1000 / 10
              WHEN NEW.PartStat = 7 THEN (unitValue + ${increase_7and8} - 3) / 0.002
              WHEN NEW.PartStat = 8 THEN (unitValue + ${increase_7and8} - 5) / 0.002
              WHEN NEW.PartStat = 9 THEN (unitValue + ${increase_9} - 7) / 0.001
              WHEN NEW.PartStat = 10 THEN ((unitValue + ${increase_perc}) - 90) * 1000 / 10
              WHEN NEW.PartStat = 11 THEN (85 - (unitValue + ${increase_perc})) * 1000 / 20
              WHEN NEW.PartStat = 12 THEN ((unitValue + ${increase_perc}) - 70) * 1000 / 15
              WHEN NEW.PartStat = 13 THEN (unitValue + ${increase_perc}) * 10
              WHEN NEW.PartStat = 14 THEN (85 - (unitValue + ${increase_perc})) * 1000 / 15
              WHEN NEW.PartStat = 15 THEN ((unitValue + ${increase_perc}) - 40) * 1000 / 30
              WHEN NEW.PartStat = 18 THEN ((unitValue + ${increase_perc}) - 40) * 1000 / 30
              WHEN NEW.PartStat = 19 THEN ((unitValue + ${increase_perc}) - 40) * 1000 / 30
              ELSE NULL
            END
          WHERE DesignID = NEW.DesignID
          AND PartStat = NEW.PartStat AND PartStat != 15;
          
          UPDATE Parts_TeamExpertise
          SET Expertise = Expertise * (
              (SELECT Value
              FROM Parts_Designs_StatValues
              WHERE DesignID = NEW.DesignID
                AND PartStat = NEW.PartStat)
              /
              COALESCE(
                (SELECT Value
                FROM Parts_Designs_StatValues
                WHERE PartStat = NEW.PartStat
                  AND DesignID = (
                      SELECT MAX(DesignID)
                      FROM Parts_Designs
                      WHERE DesignID < NEW.DesignID
                        AND PartType = (SELECT PartType 
                                        FROM Parts_Designs 
                                        WHERE DesignID = NEW.DesignID)
                        AND TeamID = (SELECT TeamID 
                                      FROM Parts_Designs 
                                      WHERE DesignID = NEW.DesignID)
                  )
                ),
                (SELECT Value 
                FROM Parts_Designs_StatValues 
                WHERE DesignID = NEW.DesignID 
                  AND PartStat = NEW.PartStat
                )
              )
          )
          WHERE TeamID = (SELECT TeamID FROM Parts_Designs WHERE DesignID = NEW.DesignID)
            AND PartType = (SELECT PartType FROM Parts_Designs WHERE DesignID = NEW.DesignID)
            AND PartStat = NEW.PartStat;

        END;
      `;
    queryDB(triggerSQL, [], 'run');
  }
}

export function manageInstantBuildTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS instant_build_insane", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS instant_build_impossible", [], 'run');
}

export function manageResearchTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS research_extraHard", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS research_brutal", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS research_unfair", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS research_insane", [], 'run');
  queryDB("DROP TRIGGER IF EXISTS research_impossible", [], 'run');
  triggerLevel = parseInt(triggerLevel);
  let triggerSQL = "";
  if (triggerLevel > 0) {
    const triggerName = `research_${difficultyDict[triggerLevel].name}`;
    const researchExp = difficultyDict[triggerLevel].research;
    triggerSQL = `
        CREATE TRIGGER ${triggerName}
        AFTER UPDATE ON Parts_Designs
        FOR EACH ROW
        WHEN NEW.DesignWork >= NEW.DesignWorkMax
        AND NEW.TeamID != (SELECT TeamID FROM Player)
        AND NEW.ValidFrom = (SELECT CurrentSeason FROM Player_State) + 1
        BEGIN
          UPDATE Parts_Designs_StatValues
          SET ExpertiseGain = ExpertiseGain + ${researchExp}
          WHERE DesignID = NEW.DesignID;
          
          UPDATE Parts_TeamExpertise
          SET NextSeasonExpertise = NextSeasonExpertise + ${researchExp / 2}
          WHERE TeamID = NEW.TeamID
          AND PartType = NEW.PartType;
        END;
      `;
    queryDB(triggerSQL, [], 'run');
  }
}

export function upgradeFactories(triggerLevel) {
  if (triggerLevel === 4) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 34, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID < 34", [], 'run');
  } else if (triggerLevel === 6) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 35, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID < 35", [], 'run');
  } else if (triggerLevel === -1) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 33, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID >= 34", [], 'run');
  }
}

export function manageRefurbishTrigger(type) {
  queryDB("DROP TRIGGER IF EXISTS refurbish_fix", [], 'run');
  if (type === 1) {
    const triggerSQL = `
        CREATE TRIGGER refurbish_fix
        AFTER UPDATE ON Buildings_HQ
        FOR EACH ROW
        BEGIN
          UPDATE Buildings_HQ
          SET DegradationValue = 1
          WHERE DegradationValue < 0.7
          AND TeamID != (SELECT TeamID FROM Player);
        END;
      `;
    queryDB(triggerSQL, [], 'run');
  }
}

export function fetchExistingTriggers() {
  let highest_difficulty = 0;
  const triggerList = {
    lightDif: -1,
    researchDif: -1,
    buildDif: -1,
    statDif: -1,
    designTimeDif: -1
  };
  let refurbish = 0;
  let frozenMentality = 0;
  const triggers = queryDB("SELECT name FROM sqlite_master WHERE type='trigger';", [], "allRows");
  if (triggers && triggers.length) {
    triggers.forEach(row => {
      const triggerName = row[0];
      const parts = triggerName.split("_");
      const dif = parts[parts.length - 1];
      const dif_level = invertedDifficultyDict[dif] !== undefined ? invertedDifficultyDict[dif] : 0;
      const type_trigger = parts[0];
      if (type_trigger === "difficulty") {
        triggerList.statDif = dif_level;
      } else if (type_trigger === "designTime") {
        triggerList.designTimeDif = dif_level;
      } else if (type_trigger === "instant") {
        triggerList.buildDif = dif_level;
      } else if (type_trigger === "research") {
        triggerList.researchDif = dif_level;
      } else if (type_trigger === "reduced") {
        console.log("Found weight trigger with difficulty level:", dif_level);
        if (dif_level === 6) {
          triggerList.lightDif = 2;
        }
        else{
          triggerList.lightDif = dif_level;
        }
      } else if (type_trigger === "refurbish") {
        refurbish = 1;
      } else if (type_trigger === "clear") {
        frozenMentality = 1;
      }
      if (dif_level > highest_difficulty) highest_difficulty = dif_level;
    });
  }
  return { highest_difficulty, triggerList, refurbish, frozenMentality };
}

export function editFreezeMentality(state) {
  if (state === 0) {
    queryDB("DROP TRIGGER IF EXISTS update_Opinion_After_Insert;", [], 'run');
    queryDB("DROP TRIGGER IF EXISTS update_Opinion_After_Update;", [], 'run');
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_Statuses;", [], 'run');
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_AreaOpinions;", [], 'run');
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_Events;", [], 'run');
    queryDB("DROP TRIGGER IF EXISTS reset_Staff_State;", [], 'run');
  } else {
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Insert
      AFTER INSERT ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `, [], 'run');
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Update
      AFTER UPDATE OF Opinion ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `, [], 'run');
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Statuses
      AFTER INSERT ON Staff_Mentality_Statuses
      BEGIN
        DELETE FROM Staff_Mentality_Statuses;
      END;
    `, [], 'run');
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Events
      AFTER INSERT ON Staff_Mentality_Events
      BEGIN
        DELETE FROM Staff_Mentality_Events;
      END;
    `, [], 'run');
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS reset_Staff_State
      AFTER UPDATE ON Staff_State
      BEGIN
        UPDATE Staff_State
        SET Mentality = 50, MentalityOpinion = 2;
      END;
    `, [], 'run');
  }
}
