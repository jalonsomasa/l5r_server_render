"use strict";

const Utils = require( "../Utils" );

const Signal = require( "signals" ).Signal;


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function TimeoutManager() 
{
    this._intervalId = null;
    this._arrTimeout = null;
    this._timeoutId = 0;

    // Signals.
    this._onTimerTick = new Signal();
};
module.exports = TimeoutManager;
TimeoutManager.prototype.constructor = TimeoutManager;


//===================================================
// Public
//===================================================

TimeoutManager.prototype.init = function() 
{
    this._intervalId = setInterval( this._onTimer_Tick.bind( this ), 1000 );
    this._arrTimeout = [];
};

TimeoutManager.prototype.end = function() 
{
    clearInterval( this._intervalId );
    this._intervalId = null;
    this._arrTimeout = null;
};

TimeoutManager.prototype.setTimeout = function( cb, time ) 
{
    const kTimeoutId = this._timeoutId;
    this._arrTimeout.push( { id: kTimeoutId, cb: cb, time: time } );

    this._timeoutId += 1;
    if ( this._timeoutId > Number.MAX_SAFE_INTEGER )
    {
        this._timeoutId = 0;
    }
    
    return kTimeoutId;
};

TimeoutManager.prototype.remove = function( timeoutId ) 
{
    for ( let i = 0; i < this._arrTimeout.length; ++i )
    {
        if ( this._arrTimeout[ i ].id == timeoutId )
        {
            this._arrTimeout.splice( i, 1 );
            break;
        }
    }
};


//===================================================
// Callbacks 
//===================================================

TimeoutManager.prototype._onTimer_Tick = function() 
{
    for ( let i = this._arrTimeout.length - 1; i >= 0; --i )
    {
        let timeout = this._arrTimeout[ i ];
        timeout.time -= 1;
        Utils.logMessage( "TimeoutManager :: _onTimer_Tick :: timeout.time: " + timeout.time );
        if ( timeout.time <= 0 )
        {
            try
            {
                timeout.cb();
            }
            catch ( err  ) 
            { 
                Utils.logMessage( err.message );
            }
            this._arrTimeout.splice( i, 1 );
        }
    }

    this._onTimerTick.dispatch();
};


//===================================================
// Getters / Setters
//===================================================

// Signals.
Object.defineProperty(
	TimeoutManager.prototype, 
	"onTimerTick", 
    { get: function() { return this._onTimerTick; } } );