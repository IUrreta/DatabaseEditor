import { getDBUtils } from "../../frontend/dragFile";

export default class SaveSelectedCommand {
    /**
     * Constructor del comando.
     * @param {Object} message - Mensaje que contiene los datos necesarios.
     */
    constructor(message) {
        this.message = message;
    }

    /**
     * Ejecuta el comando de guardar la selección.
     */
    execute() {
        const dbUtils = getDBUtils();

        const yearData = dbUtils.checkYearSave();
        console.log("Year data:", yearData);


    }
}
