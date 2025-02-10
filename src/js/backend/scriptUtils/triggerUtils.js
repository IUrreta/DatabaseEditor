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
    perc: 0.1,
    "7and8": 0.002,
    "9": 0.001,
    reduction: 0,
    research: 8
  },
  3: {
    name: "brutal",
    perc: 0.15,
    "7and8": 0.003,
    "9": 0.0015,
    reduction: 0.05,
    research: 14
  },
  4: {
    name: "unfair",
    perc: 0.3,
    "7and8": 0.006,
    "9": 0.003,
    reduction: 0.11,
    research: 30
  },
  5: {
    name: "insane",
    perc: 0.35,
    "7and8": 0.007,
    "9": 0.0035,
    reduction: 0.16,
    research: 45
  },
  6: {
    name: "impossible",
    perc: 0.48,
    "7and8": 0.0096,
    "9": 0.0048,
    reduction: 0.2,
    research: 65
  }
};


const invertedDifficultyDict = Object.fromEntries(
  Object.entries(difficultyDict).map(([key, entry]) => [entry.name, Number(key)])
);

export function manageDifficultyTriggers(triggerList) {
  if (triggerList.statDif) manageDesignBoostTriggers(triggerList.statDif);
  if (triggerList.designTimeDif) manageDesignTimeTriggers(triggerList.designTimeDif);
  if (triggerList.lightDif) manageWeightTrigger(triggerList.lightDif);
  if (triggerList.buildDif) manageInstantBuildTriggers(triggerList.buildDif);
  if (triggerList.researchDif) manageResearchTriggers(triggerList.researchDif);
}

export function manageWeightTrigger(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_normal");
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_extreme");
  queryDB("DROP TRIGGER IF EXISTS reduced_weight_impossible");
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
    } else if (triggerLevel === 6) {
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
    if (triggerSQL) queryDB(triggerSQL);
  }
}

export function manageDesignTimeTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS designTime_extraHard");
  queryDB("DROP TRIGGER IF EXISTS designTime_brutal");
  queryDB("DROP TRIGGER IF EXISTS designTime_unfair");
  queryDB("DROP TRIGGER IF EXISTS designTime_insane");
  queryDB("DROP TRIGGER IF EXISTS designTime_impossible");
  let triggerSQL = "";
  if (triggerLevel > 0) {
    const triggerName = `designTime_${difficultyDict[triggerLevel].name}`;
    const reduction = difficultyDict[triggerLevel].reduction;
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
          UPDATE Parts_Designs
          SET DesignWork = DesignWork + (${reduction} * (DesignWorkMax - DesignWork))
          WHERE DesignID = NEW.DesignID
          AND DayCompleted = -1 AND DesignWork IS NOT NULL;
        END;
      `;
    queryDB(triggerSQL);
  }
}

export function manageDesignBoostTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS difficulty_extraHard");
  queryDB("DROP TRIGGER IF EXISTS difficulty_brutal");
  queryDB("DROP TRIGGER IF EXISTS difficulty_unfair");
  queryDB("DROP TRIGGER IF EXISTS difficulty_insane");
  queryDB("DROP TRIGGER IF EXISTS difficulty_impossible");
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
          SET Expertise = (SELECT Value FROM Parts_Designs_StatValues WHERE DesignID = NEW.DesignID AND PartStat = NEW.PartStat) / 0.8
          WHERE TeamID = (SELECT TeamID FROM Parts_Designs WHERE DesignID = NEW.DesignID)
          AND PartType = (SELECT PartType FROM Parts_Designs WHERE DesignID = NEW.DesignID)
          AND PartStat = NEW.PartStat;
        END;
      `;
    queryDB(triggerSQL);
  }
}

export function manageInstantBuildTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS instant_build_insane");
  queryDB("DROP TRIGGER IF EXISTS instant_build_impossible");
  let triggerSQL = "";
  if (triggerLevel > 0) {
    const triggerName = `instant_build_${difficultyDict[triggerLevel].name}`;
    if (triggerLevel === 5) {
      triggerSQL = `
          CREATE TRIGGER ${triggerName}
          AFTER UPDATE ON Parts_Designs
          FOR EACH ROW
          WHEN NEW.DesignWork >= NEW.DesignWorkMax
          AND NEW.TeamID != (SELECT TeamID FROM Player)
          AND NEW.DayCompleted = -1
          AND NEW.DayCreated != -1
          BEGIN
            INSERT INTO Parts_Items (ItemID, DesignID, BuildWork, Condition, ManufactureNumber, ProjectID, AssociatedCar, InspectionState, LastEquippedCar)
            VALUES (
              (SELECT IFNULL(MAX(ItemID), 0) + 1 FROM Parts_Items), 
              NEW.DesignID,                                        
              CASE NEW.PartType                                    
                WHEN 3 THEN 2000
                WHEN 4 THEN 500
                WHEN 5 THEN 500
                WHEN 6 THEN 1500
                WHEN 7 THEN 1500
                WHEN 8 THEN 1500
                ELSE 1000 
              END,
              1,
              NEW.ManufactureCount + 1,
              NULL, NULL, 0, NULL
            );
            
            UPDATE Parts_Designs
            SET ManufactureCount = NEW.ManufactureCount + 1
            WHERE DesignID = NEW.DesignID;
          END;
        `;
    } else if (triggerLevel === 6) {
      triggerSQL = `
          CREATE TRIGGER ${triggerName}
          AFTER UPDATE ON Parts_Designs
          FOR EACH ROW
          WHEN NEW.DesignWork >= NEW.DesignWorkMax
          AND NEW.TeamID != (SELECT TeamID FROM Player)
          AND NEW.DayCompleted = -1
          AND NEW.DayCreated != -1
          BEGIN
            INSERT INTO Parts_Items (ItemID, DesignID, BuildWork, Condition, ManufactureNumber, ProjectID, AssociatedCar, InspectionState, LastEquippedCar)
            VALUES (
              (SELECT IFNULL(MAX(ItemID), 0) + 1 FROM Parts_Items),
              NEW.DesignID,                                        
              CASE NEW.PartType                                    
                WHEN 3 THEN 2000
                WHEN 4 THEN 500
                WHEN 5 THEN 500
                WHEN 6 THEN 1500
                WHEN 7 THEN 1500
                WHEN 8 THEN 1500
                ELSE 1000
              END,
              1,
              NEW.ManufactureCount + 1,
              NULL, NULL, 0, NULL
            );
            
            INSERT INTO Parts_Items (ItemID, DesignID, BuildWork, Condition, ManufactureNumber, ProjectID, AssociatedCar, InspectionState, LastEquippedCar)
            VALUES (
              (SELECT IFNULL(MAX(ItemID), 0) + 1 FROM Parts_Items), 
              NEW.DesignID,                                        
              CASE NEW.PartType                                    
                WHEN 3 THEN 2000
                WHEN 4 THEN 500
                WHEN 5 THEN 500
                WHEN 6 THEN 1500
                WHEN 7 THEN 1500
                WHEN 8 THEN 1500
                ELSE 1000 
              END,
              1,
              NEW.ManufactureCount + 2,
              NULL, NULL, 0, NULL
            );
            
            UPDATE Parts_Designs
            SET ManufactureCount = NEW.ManufactureCount + 2
            WHERE DesignID = NEW.DesignID;
          END;
        `;
    }
    if (triggerSQL) queryDB(triggerSQL);
  }
}

export function manageResearchTriggers(triggerLevel) {
  queryDB("DROP TRIGGER IF EXISTS research_extraHard");
  queryDB("DROP TRIGGER IF EXISTS research_brutal");
  queryDB("DROP TRIGGER IF EXISTS research_unfair");
  queryDB("DROP TRIGGER IF EXISTS research_insane");
  queryDB("DROP TRIGGER IF EXISTS research_impossible");
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
    queryDB(triggerSQL);
  }
}

export function upgradeFactories(triggerLevel) {
  if (triggerLevel === 4) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 34, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID < 34");
  } else if (triggerLevel === 6) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 35, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID < 35");
  } else if (triggerLevel === -1) {
    queryDB("UPDATE Buildings_HQ SET BuildingID = 33, DegradationValue = 1 WHERE BuildingType = 3 AND TeamID != (SELECT TeamID FROM Player) AND BuildingID >= 34");
  }
}

export function manageRefurbishTrigger(type) {
  queryDB("DROP TRIGGER IF EXISTS refurbish_fix");
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
    queryDB(triggerSQL);
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
  const triggers = queryDB("SELECT name FROM sqlite_master WHERE type='trigger';", "allRows");
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
        triggerList.lightDif = dif_level;
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
    queryDB("DROP TRIGGER IF EXISTS update_Opinion_After_Insert;");
    queryDB("DROP TRIGGER IF EXISTS update_Opinion_After_Update;");
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_Statuses;");
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_AreaOpinions;");
    queryDB("DROP TRIGGER IF EXISTS clear_Staff_Mentality_Events;");
    queryDB("DROP TRIGGER IF EXISTS reset_Staff_State;");
  } else {
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Insert
      AFTER INSERT ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Update
      AFTER UPDATE OF Opinion ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Statuses
      AFTER INSERT ON Staff_Mentality_Statuses
      BEGIN
        DELETE FROM Staff_Mentality_Statuses;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Events
      AFTER INSERT ON Staff_Mentality_Events
      BEGIN
        DELETE FROM Staff_Mentality_Events;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS reset_Staff_State
      AFTER UPDATE ON Staff_State
      BEGIN
        UPDATE Staff_State
        SET Mentality = 50, MentalityOpinion = 2;
      END;
    `);
  }
}

