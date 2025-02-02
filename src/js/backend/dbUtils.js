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
}
