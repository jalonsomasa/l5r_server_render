"use strict";

const Signal = require( "signals" ).Signal;


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function CombatReconnector() 
{
    this._timeoutManager = null;

    this._arrReconnection = null;

    // Signals.
    this._onReconnectFailed = new Signal();
};
module.exports = CombatReconnector;
CombatReconnector.prototype.constructor = CombatReconnector;


//===================================================
// Public
//===================================================

CombatReconnector.prototype.init = function() 
{
    console.assert( this._timeoutManager != null, "CombatReconnector :: init() :: this._timeoutManager cannot be null." );

    this._arrReconnection = [];
};

CombatReconnector.prototype.end = function() 
{
    this._timeoutManager = null;
    this._arrReconnection = null;
};

CombatReconnector.prototype.add = function( reconnection ) 
{
    this._arrReconnection.push( reconnection );
    
    const kTimeoutId = this._timeoutManager.setTimeout( this._onReconnect_Failed.bind( this, reconnection ), 10 );
    reconnection.timeoutId = kTimeoutId;
};

CombatReconnector.prototype.remove = function( userId ) 
{
    for ( let i = this._arrReconnection.length - 1; i >= 0; --i )
    {
        const kReconnection = this._arrReconnection[ i ];
        if ( kReconnection.userId == userId )
        {
            this._arrReconnection.splice( i, 1 );
            
            this._timeoutManager.remove( kReconnection.timeoutId );
        }
    }
};


//===================================================
// Private 
//===================================================

CombatReconnector.prototype._onReconnect_Failed = function( reconnection )
{
    this._arrReconnection.splice( this._arrReconnection.indexOf( reconnection ) );
    
    this._onReconnectFailed.dispatch( reconnection );
};


//===================================================
// Getters / Setters
//===================================================

Object.defineProperty(
	CombatReconnector.prototype, 
	"timeoutManager", 
    { set: function( value ) { this._timeoutManager = value; } } );

// Signals.
Object.defineProperty(
    CombatReconnector.prototype, 
    "onReconnectFailed", 
    { get: function() { return this._onReconnectFailed; } } );