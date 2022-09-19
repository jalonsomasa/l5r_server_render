"use strict";


function DataModel() {}
module.exports = DataModel;


//===================================================
// Attributes
//===================================================

/**
 * @type {Map}
 * @static
 * @const
 */
DataModel.mapUserIdToUser = new Map();

/**
 * @type {Map}
 * @static
 * @const
 */
DataModel.mapGameIdToGame = new Map();