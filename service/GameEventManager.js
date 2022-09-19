"use strict";

const DataModel = require( "../DataModel" );
const Utils = require( "../Utils" );


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function GameEventManager() {};
module.exports = GameEventManager;
GameEventManager.prototype.constructor = GameEventManager;


//===================================================
// Public
//===================================================

GameEventManager.prototype.init = function() {};
GameEventManager.prototype.end = function() {};

GameEventManager.prototype.add = function( user ) 
{
	user.socket.on( "notifyAction", Utils.callAndCatchErrors.bind( this, this._onNotifyAction, user ) );
	user.socket.on( "gameOver", Utils.callAndCatchErrors.bind( this, this._onGameOver, user ) );
};

GameEventManager.prototype.remove = function( user ) 
{
	user.socket.removeAllListeners( "notifyAction" );
	user.socket.removeAllListeners( "gameOver" );
};


//===================================================
// Private
//===================================================

// #region Common //

GameEventManager.prototype._onNotifyAction = function( myUser, actionType, gameStateId, args, isEcho ) 
{
	myUser.opponent.socket.emit( "oppActionNotified", actionType, gameStateId, args );
	if ( isEcho )
	{
		myUser.socket.emit( "oppActionNotified", actionType, gameStateId, args );
	}
};

GameEventManager.prototype._onGameOver = function( myUser ) 
{
	if ( DataModel.mapGameIdToGame.has( myUser.gameId ) )
	{
		DataModel.mapGameIdToGame.delete( myUser.gameId )
	}

	this.remove( myUser );

	myUser.setUserStatus( 0 );
};

// #endregion //