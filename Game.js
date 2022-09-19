"use strict";


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function Game() 
{
	this._gameId = null;
	this._arrUser = null;
};
module.exports = Game;
Game.prototype.constructor = Game;


//===================================================
// Public
//===================================================

Game.prototype.init = function() 
{
	console.assert( this._gameId != null, "Game.js :: init() :: this._gameId cannot be null." );

	this._arrUser = [];
};

Game.prototype.isEmpty = function() 
{
	return !this._arrUser[ 0 ] && !this._arrUser[ 1 ];
};

Game.prototype.onReconnect = function( myUser ) 
{
	for ( let i = 0; i < this._arrUser.length; ++i )
	{
		if ( !this._arrUser[ i ] )
		{
			let oppUser = this._arrUser[ i == 0 ? 1 : 0 ];
			oppUser.opponent = myUser;

			this._arrUser[ i ] = myUser;
			myUser.gameId = this._gameId;
			myUser.opponent = oppUser;
			break;
		}
	}
};

Game.prototype.onDisconnect = function( myUser ) 
{
	for ( let i = 0; i < this._arrUser.length; ++i )
	{
		if ( this._arrUser[ i ] == myUser )
		{
			this._arrUser[ i ] = null;
			break;
		}
	}
};


//===================================================
// Getters / Setters
//===================================================

Object.defineProperty(
	Game.prototype, 
	"gameId", 
	{ 
		get: function() { return this._gameId; },
		set: function( value ) { this._gameId = value; } 
	} );

Object.defineProperty(
	Game.prototype, 
	"players", 
	{ 
		get: function() { return this._arrUser; } 
	} );