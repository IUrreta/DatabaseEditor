/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/backend/commands/dbWorker.js":
/*!*********************************************!*\
  !*** ./src/js/backend/commands/dbWorker.js ***!
  \*********************************************/
/***/ (() => {

eval("self.onmessage = event => {\n  const {\n    type,\n    payload\n  } = event.data;\n  if (type === 'init') {\n    // Inicializamos el objeto DBUtils\n    dbUtils = payload.dbUtils;\n    return;\n  }\n  if (type === 'execute') {\n    const {\n      year\n    } = payload;\n    // Asegúrate de tener acceso a dbUtils\n    if (!dbUtils) {\n      self.postMessage({\n        error: 'DBUtils is not initialized'\n      });\n      return;\n    }\n\n    // Simulación de una operación usando dbUtils\n    const results = dbUtils.fetchSeasonResults(year);\n    self.postMessage({\n      results\n    });\n  }\n};\n\n//# sourceURL=webpack://Database_Editor_F1_Manager/./src/js/backend/commands/dbWorker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/backend/commands/dbWorker.js"]();
/******/ 	
/******/ })()
;