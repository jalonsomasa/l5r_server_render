"use strict";

const Game = require( "../Game" );
const DataModel = require( "../DataModel" );
const Utils = require( "../Utils" );


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function GatewayEventManager() 
{
	this._gameEventManager = null;
};
module.exports = GatewayEventManager;
GatewayEventManager.prototype.constructor = GatewayEventManager;


//===================================================
// Public
//===================================================

GatewayEventManager.prototype.init = function() {};
GatewayEventManager.prototype.end = function() {};

GatewayEventManager.prototype.add = function( user ) 
{
	// Player list.
	user.socket.on( "retrieveUserList", Utils.callAndCatchErrors.bind( this, this._onRetrieveUserList, user ) );
	user.socket.on( "inviteToChallenge", Utils.callAndCatchErrors.bind( this, this._onInviteToChallenge, user ) );
	user.socket.on( "cancelChallengeInvitation", Utils.callAndCatchErrors.bind( this, this._onCancelChallengeInvitation, user ) );
	user.socket.on( "acceptChallengeInvitation", Utils.callAndCatchErrors.bind( this, this._onAcceptChallengeInvitation, user ) );
	user.socket.on( "rejectChallengeInvitation", Utils.callAndCatchErrors.bind( this, this._onRejectChallengeInvitation, user ) );
	user.socket.on( "setUserStatus", Utils.callAndCatchErrors.bind( this, this._onSetUserStatus, user ) );
	// Game room.
	user.socket.on( "setReadyStatus", Utils.callAndCatchErrors.bind( this, this._onSetReadyStatus, user ) );
	user.socket.on( "loadGame", Utils.callAndCatchErrors.bind( this, this._onLoadGame, user ) );
	user.socket.on( "leaveGameRoom", Utils.callAndCatchErrors.bind( this, this._onLeaveGameRoom, user ) );
	user.socket.on( "opponentGameCreated", Utils.callAndCatchErrors.bind( this, this._onOpponentGameCreated, user ) );
	// Chat.
	user.socket.on( "sendPrivateMessage", Utils.callAndCatchErrors.bind( this, this._onSendPrivateMessage, user ) );
	user.socket.on( "sendGlobalMessage", Utils.callAndCatchErrors.bind( this, this._onSendGlobalMessage, user ) );
	user.socket.on( "sendGameMessage", Utils.callAndCatchErrors.bind( this, this._onSendGameMessage, user ) );
};

GatewayEventManager.prototype.remove = function( user ) 
{
	// Player list.
	user.socket.removeAllListeners( "retrieveUserList" );
	user.socket.removeAllListeners( "inviteToChallenge" );
	user.socket.removeAllListeners( "cancelChallengeInvitation" );
	user.socket.removeAllListeners( "acceptChallengeInvitation" );
	user.socket.removeAllListeners( "rejectChallengeInvitation" );
	user.socket.removeAllListeners( "setUserStatus" );
	// Game room.
	user.socket.removeAllListeners( "setReadyStatus" );
	user.socket.removeAllListeners( "loadGame" );
	user.socket.removeAllListeners( "leaveGameRoom" );
	user.socket.removeAllListeners( "opponentGameCreated" );
	// Chat.
	user.socket.removeAllListeners( "sendPrivateMessage" );
	user.socket.removeAllListeners( "sendGlobalMessage" );
	user.socket.removeAllListeners( "sendGameMessage" );
};


//===================================================
// Private
//===================================================

// #region Player List //

GatewayEventManager.prototype._onRetrieveUserList = function( myUser ) 
{
	let arrUser = [];
	for ( const [ key, value ] of DataModel.mapUserIdToUser.entries() )  
	{
		arrUser.push( { id: key, status: value.userStatus } );
	}

	myUser.socket.emit( "userListRetrieved", arrUser );
};

GatewayEventManager.prototype._onInviteToChallenge = function( myUser, userId, gameType ) 
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "challengeInvitationReceived", myUser.userId, gameType );

		oppUser.setUserStatus( 1 );
	}
	myUser.setUserStatus( 1 );
};

GatewayEventManager.prototype._onCancelChallengeInvitation = function( myUser, userId ) 
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "challengeInvitationCanceled", myUser.userId );

		oppUser.setUserStatus( 0 );
	}
	myUser.setUserStatus( 0 );
};

GatewayEventManager.prototype._onAcceptChallengeInvitation = function( myUser, userId )
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.opponent = myUser;

		myUser.opponent = oppUser;
		
		oppUser.socket.emit( "challengeInvitationAccepted", myUser.userId );
	
		oppUser.setUserStatus( 2 );
	}
	myUser.setUserStatus( 2 );
};

GatewayEventManager.prototype._onRejectChallengeInvitation = function( myUser, userId )
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "challengeInvitationRejected", myUser.userId );

		oppUser.setUserStatus( 0 );
	}
	myUser.setUserStatus( 0 );
};

GatewayEventManager.prototype._onSetUserStatus = function( myUser, userStatus )
{
	myUser.setUserStatus( userStatus );
};

// #endregion //

// #region Game Room //

GatewayEventManager.prototype._onSetReadyStatus = function( myUser, deck )
{
	myUser.deck = deck;

	let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
	oppUser.socket.emit( "userReadyReceived" );

	if ( oppUser.deck )
	{
		oppUser.opponent = myUser;

		// Notify players.
		const kPrngSeed = Math.floor( Math.random() * 10000 );
		const kFirstPlayerId = Math.random() > 0.5 ? oppUser.userId : myUser.userId;
		const kGameId = myUser.userId + "_vs_" + oppUser.userId + "_" + Date.now().toString();
		myUser.socket.emit( "gameCreated", oppUser.deck, kPrngSeed, kFirstPlayerId, kGameId );
		oppUser.socket.emit( "gameCreated", myUser.deck, kPrngSeed, kFirstPlayerId, kGameId );

		// Create the game.
		let game = new Game();
		game.gameId = kGameId;
		game.init();
		game.players.push( myUser );
		game.players.push( oppUser )
		DataModel.mapGameIdToGame.set( kGameId, game );

		myUser.gameId = kGameId;
		oppUser.gameId = kGameId;

		this._gameEventManager.add( myUser );
		this._gameEventManager.add( oppUser );

		myUser.setUserStatus( 3 );
		oppUser.setUserStatus( 3 );
	}
};

GatewayEventManager.prototype._onLoadGame = function( myUser, saveGame )
{
	let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
	oppUser.opponent = myUser;

	// Notify players.
	const kPrngSeed = Math.floor( Math.random() * 10000 );
	const kGameId = myUser.userId + "_vs_" + oppUser.userId + "_" + Date.now().toString();
	myUser.socket.emit( "gameLoaded", kPrngSeed, kGameId, saveGame );
	oppUser.socket.emit( "gameLoaded", kPrngSeed, kGameId, saveGame );

	// Create the game.
	let game = new Game();
	game.gameId = kGameId;
	game.init();
	game.players.push( myUser );
	game.players.push( oppUser )
	DataModel.mapGameIdToGame.set( kGameId, game );

	myUser.gameId = kGameId;
	oppUser.gameId = kGameId;

	this._gameEventManager.add( myUser );
	this._gameEventManager.add( oppUser );

	myUser.setUserStatus( 3 );
	oppUser.setUserStatus( 3 );
};

GatewayEventManager.prototype._onLeaveGameRoom = function( myUser ) 
{
	let oppUser = myUser.opponent;
	oppUser.socket.emit( "userLeftRoom" );

	myUser.setUserStatus( 0 );
	oppUser.setUserStatus( 0 );
};

GatewayEventManager.prototype._onOpponentGameCreated = function( myUser ) 
{
	let oppUser = myUser.opponent;
	oppUser.socket.emit( "opponentGameCreated" );
};

// #endregion //

// #region Chat //

GatewayEventManager.prototype._onSendPrivateMessage = function( myUser, to, message )
{
	if ( DataModel.mapUserIdToUser.has( to ) )
	{
		DataModel.mapUserIdToUser.get( to ).socket.emit( "privateMessageReceived", myUser.userId, message, new Date() );
	}
};

GatewayEventManager.prototype._onSendGlobalMessage = function( myUser, message ) 
{
	myUser.socket.broadcast.emit( "globalMessageReceived", myUser.userId, message, new Date() );
};

GatewayEventManager.prototype._onSendGameMessage = function( myUser, message ) 
{
	if ( DataModel.mapUserIdToUser.has( myUser.opponent.userId ) )
	{
		DataModel.mapUserIdToUser.get( myUser.opponent.userId ).socket.emit( "gameMessageReceived", myUser.userId, message, new Date() );
	}
};

// #endregion //


//===================================================
// Getters / Setters
//===================================================

// Signals.
Object.defineProperty(
	GatewayEventManager.prototype, 
	"gameEventManager", 
    { set: function( value ) { this._gameEventManager = value; } } );