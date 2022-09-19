"use strict";

const Config = require( "./Config" );

const Signal = require( "signals" ).Signal;
const XMLHttpRequest = require( "xmlhttprequest" ).XMLHttpRequest;


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function AmpPhpRequest() 
{
    // Signals.
    this._onCompleted = new Signal();
};
module.exports = AmpPhpRequest;
AmpPhpRequest.prototype.constructor = AmpPhpRequest;


//===================================================
// Public
//===================================================

AmpPhpRequest.prototype.execute = function( serviceName, methodName, parameters ) 
{
    let xhttp = new XMLHttpRequest();
    let that = this;
    xhttp.onreadystatechange = function() {
        if ( xhttp.readyState == 4 && xhttp.status == 200 ) 
        {
            try 
            {
                that._onCompleted.dispatch( JSON.parse( xhttp.responseText ) );
            }
            catch ( ex )
            {
                // The server may return a DB error message instead of a valid value.
                // It would be better if the server captured these exceptions and returned a result value.
                console.log( "AmfPhpRequest.js :: execute() :: ex.message=" + ex.message + " :: xhttp.responseText=" + xhttp.responseText );
            }
        }
    };
    xhttp.open( "POST", Config.amfPhpUrl, true );    
    xhttp.send( JSON.stringify( {
        "serviceName": serviceName,
        "methodName": methodName,
        "parameters": parameters } ) );
};


//===================================================
// Getters / Setters
//===================================================

// Signals.
Object.defineProperty(
    AmpPhpRequest.prototype, 
    "onCompleted", 
    { get: function() { return this._onCompleted; } } );