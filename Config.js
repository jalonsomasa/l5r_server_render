"use strict";


function Config() {}
module.exports = Config;


//===================================================
// Attributes
//===================================================

/**
 * @type {isDebugMode}
 * @static
 * @const
 */
Config.isDebugMode = false;

/**
 * @type {httpServerUrl}
 * @static
 * @const
 */
Config.httpServerUrl = null;

/**
 * @type {chatServerUrl}
 * @static
 * @const
 */
Config.chatServerUrl = null;

/**
 * @type {amfPhpUrl}
 * @static
 * @const
 */
Config.amfPhpUrl = null;


//===================================================
// Methods
//===================================================

/**
 * @type {void}
 * @static
 */
Config.init = function( chatServerPort )
{
    if ( Config.isDebugMode )
    {
        Config.httpServerUrl = "http://localhost/l5r";
        Config.chatServerUrl = "http://localhost:" + chatServerPort.toString();
        Config.amfPhpUrl = Config.httpServerUrl;
    }
    else
    {
        Config.httpServerUrl = "http://l5rdojo.epizy.com";
        Config.chatServerUrl = "https://l5r-server.onrender.com:" + chatServerPort.toString();
        Config.amfPhpUrl = Config.httpServerUrl;
    }
    Config.amfPhpUrl += "/php/?contentType=application/json";
};