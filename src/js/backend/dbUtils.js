import countries_abreviations from "./countries.js";

export default class DBUtils {
    /**
     * Constructor of the class.
     * @param {Object} db - Database object.
     * @param {Object} metadata - Metadata object.
     */
    constructor(db, metadata) {
        this.db = db;
        this.metadata = metadata;
    }

    /**
     * Function to convert an ARGB color to a hexadecimal color.
     * @param {number} argb - Color in ARGB format.
     * @returns {string} - Color in hexadecimal format.
     */
    argbToHex(argb) {
        const rgb = argb & 0xFFFFFF; // Ignora el canal alfa
        return `#${rgb.toString(16).padStart(6, '0').toUpperCase()}`;
    }

    /**
     * Verifies if the save file is from a specific year.
     * @returns {Array} - Array with the year, team name, primary color and secondary color.
     */
    checkYearSave() {
        // Checks if the table exists
        const result = this.db.exec(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='Countries_RaceRecord'"
        );

        if (result.length > 0) {
            const nameResult = this.db.exec(
                "SELECT TeamNameLocKey FROM Teams WHERE TeamID = 32"
            );

            if (nameResult.length === 0) return ["24", null, null, null];

            const nameValue = nameResult[0].values[0][0];
            const match = nameValue.match(/\[STRING_LITERAL:Value=\|(.*?)\|\]/);

            let name, primaryColor, secondaryColor;

            if (match) {
                name = match[1];

                const primaryColorResult = this.db.exec(
                    "SELECT Colour FROM Teams_Colours WHERE TeamID = 32 AND ColourID = 0"
                );
                const secondaryColorResult = this.db.exec(
                    "SELECT Colour FROM Teams_Colours WHERE TeamID = 32 AND ColourID = 1"
                );

                primaryColor = primaryColorResult.length > 0
                    ? this.argbToHex(primaryColorResult[0].values[0][0])
                    : null;

                secondaryColor = secondaryColorResult.length > 0
                    ? this.argbToHex(secondaryColorResult[0].values[0][0])
                    : null;
            } else {
                name = null;
                primaryColor = null;
                secondaryColor = null;
            }

            return ["24", name, primaryColor, secondaryColor];
        } else {
            return ["23", null, null, null];
        }
    }

    fetchNationality(driverID, gameYear) {
        if (gameYear === "24") {
            const countryResult = this.db.exec(`
            SELECT CountryID FROM Staff_BasicData WHERE StaffID = ${driverID}
          `);

            if (!countryResult.length || !countryResult[0].values.length) return "";

            const countryID = countryResult[0].values[0][0];

            const nationalityResult = this.db.exec(`
            SELECT Name FROM Countries WHERE CountryID = ${countryID}
          `);

            if (!nationalityResult.length || !nationalityResult[0].values.length) return "";

            let nationality = nationalityResult[0].values[0][0];

            const match = nationality.match(/(?<=\[Nationality_)[^\]]+/);
            if (match) {
                const nat = match[0];
                const natName = nat.replace(/(?<!^)([A-Z])/g, ' $1');
                return countries_abreviations[natName] || "";
            }

            return "";
        } else if (gameYear === "23") {
            const nationalityResult = this.db.exec(`
            SELECT Nationality FROM Staff_BasicData WHERE StaffID = ${driverID}
          `);

            if (!nationalityResult.length || !nationalityResult[0].values.length) return "";

            let nationality = nationalityResult[0].values[0][0];
            const natName = nationality.replace(/(?<!^)([A-Z])/g, ' $1');
            return countries_abreviations[natName] || "";
        }

        return "";
    }

    fetchForFutureContract(driverID) {
        const result = this.db.exec(`
          SELECT TeamID FROM Staff_Contracts WHERE StaffID = ${driverID} AND ContractType = 3
        `);

        // Si no hay resultados, devolver -1
        return result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : -1;
    }

    fetchMentality(staffID) {
        // Obtener opiniones sobre moral
        const moraleResult = this.db.exec(`
          SELECT Opinion FROM Staff_Mentality_AreaOpinions WHERE StaffID = ${staffID}
        `);

        const morale = moraleResult.length > 0 ? moraleResult[0].values : [];

        // Obtener mentalidad global
        const globalMentalityResult = this.db.exec(`
          SELECT Mentality FROM Staff_State WHERE StaffID = ${staffID}
        `);

        const globalMentality = globalMentalityResult.length > 0 && globalMentalityResult[0].values.length > 0
            ? globalMentalityResult[0].values[0][0]
            : null;

        return [morale, globalMentality];
    }



    checkDrivesForTeam32(staffData) {
        const contract = this.db.exec(`
          SELECT TeamID, PosInTeam FROM Staff_Contracts 
          WHERE StaffID = ${staffData[2]} AND ContractType = 0 AND TeamID = 32
        `).values?.[0];

        if (contract) {
            return [staffData[0], staffData[1], staffData[2], 32, contract[1], staffData[5], staffData[6], staffData[7]];
        }
        return staffData;
    }

    formatNamesAndFetchStats(nameData, type) {
        let firstName = "";
        let lastName = "";

        // Extract first name
        if (!nameData[0].includes("STRING_LITERAL")) {
            const match = nameData[0].match(/StaffName_Forename_(Male|Female)_(\w+)/);
            firstName = match ? this.removeNumber(match[2]) : "";
        } else {
            const match = nameData[0].match(/\|([^|]+)\|/);
            firstName = match ? match[1] : "";
        }

        // Extract last name
        if (!nameData[1].includes("STRING_LITERAL")) {
            const match = nameData[1].match(/StaffName_Surname_(\w+)/);
            lastName = match ? this.removeNumber(match[1]) : "";
        } else {
            const match = nameData[1].match(/\|([^|]+)\|/);
            lastName = match ? match[1] : "";
        }

        const formattedName = `${firstName} ${lastName}`;
        let teamId = nameData[3] ?? 0;
        let positionInTeam = nameData[4] ?? 0;

        if (type === "driver" && nameData[5] !== 0) {
            teamId = 0;
            positionInTeam = 0;
        }

        let result;
        if (type === "driver") {
            result = [formattedName, nameData[2], teamId, positionInTeam, nameData[6]];
        } else {
            result = [formattedName, nameData[2], teamId, positionInTeam];
        }

        // Fetch stats
        let stats, statsResult;
        if (type === "driver") {
            statsResult = this.db.exec(`
            SELECT Val FROM Staff_PerformanceStats 
            WHERE StaffID = ${nameData[2]} AND StatID BETWEEN 2 AND 10
          `);

            stats = statsResult.length > 0 ? statsResult[0].values : [];

            if (!stats.length) {
                stats = Array(9).fill([50]);
            }

            const additionalStats = this.db.exec(`
            SELECT Improvability, Aggression 
            FROM Staff_DriverData 
            WHERE StaffID = ${nameData[2]}
          `).values?.[0];

            return result.concat(stats.map(s => s[0]), additionalStats);
        }
        else if (type === "staff1") {
            statsResult = this.db.exec(`
            SELECT Val FROM Staff_PerformanceStats 
            WHERE StaffID = ${nameData[2]} AND StatID IN (0, 1, 14, 15, 16, 17)
          `);
        } else if (type === "staff2") {
            statsResult = this.db.exec(`
            SELECT Val FROM Staff_PerformanceStats 
            WHERE StaffID = ${nameData[2]} AND StatID IN (13, 25, 43)
          `);
        } else if (type === "staff3") {
            statsResult = this.db.exec(`
            SELECT Val FROM Staff_PerformanceStats 
            WHERE StaffID = ${nameData[2]} AND StatID IN (19, 20, 26, 27, 28, 29, 30, 31)
          `);
        } else if (type === "staff4") {
            statsResult = this.db.exec(`
            SELECT Val FROM Staff_PerformanceStats 
            WHERE StaffID = ${nameData[2]} AND StatID IN (11, 22, 23, 24)
          `);
        }

        stats = statsResult.length > 0 ? statsResult[0].values : [];



        return result.concat(stats.map(s => s[0]));
    }


    removeNumber(string) {
        if (string && string[string.length - 1].match(/\d/)) {
            string = string.slice(0, -1);
        }
        return string;
    }

    fetchDriverRetirement(driverID) {
        const result = this.db.exec(`
            SELECT Day, CurrentSeason FROM Player_State
          `);
        let day, currentSeason;

        if (result.length > 0 && result[0].values.length > 0) {
            [day, currentSeason] = result[0].values[0];
        } else {
            console.warn("No se encontraron datos en Player_State.");
            day = 0;
            currentSeason = 0;
        }


        const retirementResult = this.db.exec(`
            SELECT RetirementAge FROM Staff_GameData WHERE StaffID = ${driverID}
          `);
          const retirementAge = retirementResult.length > 0 && retirementResult[0].values.length > 0
            ? retirementResult[0].values[0][0]
            : null;
          
          const dobResult = this.db.exec(`
            SELECT DOB FROM Staff_BasicData WHERE StaffID = ${driverID}
          `);
          const dob = dobResult.length > 0 && dobResult[0].values.length > 0
            ? dobResult[0].values[0][0]
            : null;
          

        return [retirementAge, Math.floor((day - dob) / 365.25)];
    }

    fetchDriverCode(driverID) {
        let code = this.db.exec(`
          SELECT DriverCode FROM Staff_DriverData WHERE StaffID = ${driverID}
        `).values?.[0]?.[0];

        if (code) {
            if (!code.includes("STRING_LITERAL")) {
                const match = code.match(/\[DriverCode_(...)\]/);
                code = match ? match[1] : "";
            } else {
                const match = code.match(/\[STRING_LITERAL:Value=\|(...)\|\]/);
                code = match ? match[1] : "";
            }
        } else {
            code = "";
        }

        return code.toUpperCase();
    }

    fetchYear() {
        const result = this.db.exec(`
          SELECT Day, CurrentSeason FROM Player_State
        `);

        if (result.length === 0 || result[0].values.length === 0) {
            console.warn("No data found in Player_State.");
            return 0;
        }

        return result[0].values[0][1];
    }


    fetchDriverNumberDetails(driverID) {
        let number = this.db.exec(`
          SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = ${driverID}
        `).values?.[0];

        if (!number) {
            const availableNumbers = this.db.exec(`
            SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL
          `).values;

            number = availableNumbers.length ? availableNumbers[Math.floor(Math.random() * availableNumbers.length)] : [0];
        }

        const wantsChampionNumber = this.db.exec(`
          SELECT WantsChampionDriverNumber FROM Staff_DriverData WHERE StaffID = ${driverID}
        `).values?.[0];

        return [number[0], wantsChampionNumber];
    }

    fetchRaceFormula(driverID) {
        const result = this.db.exec(`
          SELECT MAX(
            CASE 
              WHEN (TeamID <= 10 OR TeamID = 32) THEN 1
              WHEN TeamID BETWEEN 11 AND 21 THEN 2
              WHEN TeamID BETWEEN 22 AND 31 THEN 3
              ELSE 4
            END
          ) AS Category
          FROM Staff_Contracts
          WHERE ContractType = 0 AND StaffID = ${driverID};
        `);

        return result[0].values[0];
    }

    fetchMarketability(driverID) {
        const result = this.db.exec(`
          SELECT Marketability FROM Staff_DriverData WHERE StaffID = ${driverID};
        `);

        return result[0].values[0];
    }

    fetchSuperlicense(driverID) {
        const result = this.db.exec(`
          SELECT HasSuperLicense FROM Staff_DriverData WHERE StaffID = ${driverID};
        `);

        return result[0].values[0];
    }

    fetchDrivers(gameYear) {
        const queryResult = this.db.exec(`
            SELECT DISTINCT 
              bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam, 
              MIN(con.ContractType) AS MinContractType, gam.Retired, COUNT(*)
            FROM Staff_BasicData bas
            JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
            LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID
            LEFT JOIN Staff_GameData gam ON dri.StaffID = gam.StaffID
            GROUP BY gam.StaffID
            ORDER BY con.TeamID;
          `);

        const drivers = queryResult[0].values;

        const formattedData = [];


        // Recorrer los resultados de la consulta
        for (let driver of drivers) {
            // Si hay más de un contrato, comprobar si pertenece al equipo 32
            if (driver[7] > 1) {
                driver = this.checkDrivesForTeam32(driver);
            }

            const driverID = driver[2];

            // Ignorar placeholders
            if (driver[0] !== "Placeholder") {
                // Obtener datos formateados y estadísticas
                const result = this.formatNamesAndFetchStats(driver, "driver");

                // Obtener información adicional del conductor
                const retirement = this.fetchDriverRetirement(driverID);
                let raceFormula = this.fetchRaceFormula(driverID);

                if (!raceFormula || raceFormula[0] === null) {
                    raceFormula = [4]; // Valor por defecto
                }

                const driverNumber = this.fetchDriverNumberDetails(driverID);
                const superlicense = this.fetchSuperlicense(driverID);
                const futureTeam = this.fetchForFutureContract(driverID);
                const driverCode = this.fetchDriverCode(driverID);
                const nationality = this.fetchNationality(driverID, gameYear);

                // Crear un diccionario con los datos
                const data = { ...result };
                data.driver_number = driverNumber[0];
                data.wants1 = driverNumber[1];
                data.retirement_age = retirement[0];
                data.age = retirement[1];
                data.superlicense = superlicense[0];
                data.race_formula = raceFormula[0];
                data.team_future = futureTeam;
                data.driver_code = driverCode;
                data.nationality = nationality;

                // Añadir datos específicos del año 2024
                if (gameYear === "24") {
                    const mentality = this.fetchMentality(driverID);
                    data.global_mentality = mentality[1]?.[0];

                    if (mentality[0]?.length) {
                        data.mentality0 = mentality[0][0][0];
                        data.mentality1 = mentality[0][1][0];
                        data.mentality2 = mentality[0][2][0];
                    }

                    const marketability = this.fetchMarketability(driverID);
                    data.marketability = marketability?.[0];
                }

                formattedData.push(data);
            }
        }

        return formattedData;
    }

    fetchStaff(gameYear) {
        const staffResult = this.db.exec(`
          SELECT DISTINCT 
            bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, gam.StaffType
          FROM Staff_GameData gam
          JOIN Staff_BasicData bas ON gam.StaffID = bas.StaffID
          LEFT JOIN Staff_Contracts con ON bas.StaffID = con.StaffID AND (con.ContractType = 0 OR con.ContractType IS NULL)
          WHERE gam.StaffType != 0
          ORDER BY 
            CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END, 
            con.TeamID;
        `);

        if (!staffResult.length || !staffResult[0].values.length) {
            console.warn("No staff data found.");
            return [];
        }

        const staffData = staffResult[0].values;
        const formattedData = [];

        for (let staff of staffData) {
            const staffID = staff[2];

            if (staff[0] !== "Placeholder") {
                const staffType = `staff${staff[4]}`;
                const result = this.formatNamesAndFetchStats(staff, staffType);

                const retirement = this.fetchDriverRetirement(staffID);
                let raceFormula = this.fetchRaceFormula(staffID);
                const futureTeam = this.fetchForFutureContract(staffID);
                const nationality = this.fetchNationality(staffID, gameYear);

                if (!raceFormula || raceFormula[0] === null) {
                    raceFormula = [4];
                }

                const data = { ...result };
                data.retirement_age = retirement[0];
                data.age = retirement[1];
                data.race_formula = raceFormula[0];
                data.team_future = futureTeam;
                data.nationality = nationality;

                if (gameYear === "24") {
                    const mentality = this.fetchMentality(staffID);
                    data.global_mentality = mentality[1]?.[0] ?? -1;

                    if (mentality[0]?.length) {
                        data.mentality0 = mentality[0][0]?.[0] ?? -1;
                        data.mentality1 = mentality[0][1]?.[0] ?? -1;
                        data.mentality2 = mentality[0][2]?.[0] ?? -1;
                    } else {
                        data.mentality0 = -1;
                        data.mentality1 = -1;
                        data.mentality2 = -1;
                    }
                }

                formattedData.push(data);
            }
        }


        return formattedData;
    }

    fetchCalendar() {
        const daySeasonResult = this.db.exec(`
          SELECT Day, CurrentSeason FROM Player_State
        `);
      
        if (daySeasonResult.length === 0 || daySeasonResult[0].values.length === 0) {
          console.warn("No data found in Player_State.");
          return [];
        }
      
        const [day, currentSeason] = daySeasonResult[0].values[0];
      
        const calendarResult = this.db.exec(`
          SELECT TrackID, WeatherStatePractice, WeatherStateQualifying, WeatherStateRace, WeekendType, State
          FROM Races
          WHERE SeasonID = ${currentSeason}
        `);
      
        const calendar = calendarResult.length > 0 ? calendarResult[0].values : [];
      
        return calendar;
      }



}
