"use strict";

const Config = require( "./Config" );


function Utils() {}
module.exports = Utils;


//===================================================
// Methods
//===================================================

/**
 * @type {void}
 * @static
 */
Utils.logMessage = function( message )
{
    if ( Config.isDebugMode )
    {
        console.log( message );
    }
};

/**
 * @type {void}
 * @static
 */
Utils.callAndCatchErrors = function( ...args )
{
    try
    {    
        let method = args[ 0 ];
        method.call( this, ...args.slice( 1 ) );
    }
    catch ( err )
    {
        console.log( "Utils.js :: callAndCatchErrors() :: stack=" + err.stack );
    }
};