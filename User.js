"use strict";

const ServiceLocator = require("./ServiceLocator");


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function User() 
{
	this._userId = null;
	this._socket = null;
	this._userStatus = 0;
	this._opponent = null;
	this._gameId = null;
	this._deck = null;
};
module.exports = User;
User.prototype.constructor = User;


//===================================================
// Public
//===================================================

User.prototype.init = function() 
{
	console.assert( this._userId != null, "User.js :: init() :: this._userId cannot be null." );
	console.assert( this._socket != null, "User.js :: init() :: this._socket cannot be null." );
};

User.prototype.end = function() {};

User.prototype.setUserStatus = function( userStatus ) 
{
	this._userStatus = userStatus;

	if ( userStatus == 0 )
	{
		// Idle.
		this._opponent = null;
		this._gameId = null;
		this._deck = null;
	}

	ServiceLocator.io.emit( "userStatusUpdated", this._userId, userStatus );
};


//===================================================
// Getters / Setters
//===================================================

Object.defineProperty(
	User.prototype, 
	"userId", 
	{ 
		get: function() { return this._userId; },
		set: function( value ) { this._userId = value; } 
	} );

Object.defineProperty(
	User.prototype, 
	"socket", 
	{ 
		get: function() { return this._socket; },
		set: function( value ) { this._socket = value; } 
	} );

Object.defineProperty(
	User.prototype, 
	"userStatus", 
	{ 
		get: function() { return this._userStatus; }
	} );

Object.defineProperty(
	User.prototype, 
	"opponent", 
	{ 
		get: function() { return this._opponent; },
		set: function( value ) { this._opponent = value; } 
	} );

Object.defineProperty(
	User.prototype, 
	"gameId", 
	{ 
		get: function() { return this._gameId; },
		set: function( value ) { this._gameId = value; } 
	} );

Object.defineProperty(
	User.prototype, 
	"deck", 
	{ 
		get: function() { return this._deck; },
		set: function( value ) { this._deck = value; } 
	} );