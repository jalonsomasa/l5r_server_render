"use strict";

const Config = require( "./Config" );
const DataModel = require( "./DataModel" );
const ServiceLocator = require( "./ServiceLocator" );
const Utils = require( "./Utils" );

const User = require("./User");
const AmpPhpRequest = require("./AmfPhpRequest");
const express = require( "express" )();
const http = require( "http" );

let keepAliveTimer = null;
let server = null;
let io = null;
if ( Config.isDebugMode )
{
    // Development.
    server = http.createServer( express );
    io = require( "socket.io" )( server, { wsEngine: "ws" } );
}
else
{
    // Production.
    /*const fs = require( "fs" );
    const kOptions = {
        key: fs.readFileSync( "/etc/letsencrypt/live/whitespell.net/privkey.pem" ),
        cert: fs.readFileSync( "/etc/letsencrypt/live/whitespell.net/cert.pem" ),
        ca: fs.readFileSync( "/etc/letsencrypt/live/whitespell.net/chain.pem" ) };
    server = require( "https" ).Server( kOptions, express );*/
    server = http.createServer( express );
    io = require( "socket.io" )( server, { origins: "*:*", wsEngine: "ws" } );
}


// #region Startup //

function main() 
{
    // Init global components.
    const kPort = process.env.PORT || 2053;
    Config.init( kPort );
    ServiceLocator.init();

    server.listen( kPort, function() { console.log( "listening on *:" + kPort ); } );

    io.on( "connection", Utils.callAndCatchErrors.bind( this, onClientConnected ) );

    ServiceLocator.io = io;
};

function onClientConnected( socket )
{
    const kUserId = socket.handshake.query.userId;    
    console.log( "Server.js :: onClientConnected() :: kUserId=" + kUserId );

    if ( !DataModel.mapUserIdToUser.has( kUserId ) )
    {
        let user = new User();
        user.userId = kUserId;
        user.socket = socket;
        DataModel.mapUserIdToUser.set( kUserId, user );
        DataModel.mapUserIdToLoginTime.set( kUserId, Date.now() );

        socket.on( "disconnect", Utils.callAndCatchErrors.bind( this, onDisconnect, user ) );
        socket.on( "tryGameReconnection", Utils.callAndCatchErrors.bind( this, onTryGameReconnection, user ) );

        ServiceLocator.gatewayEventManager.add( user );

        console.log( "Server.js :: onClientConnected() :: connectionAccepted" );
    
        // Notify users.
        socket.emit( "connectionAccepted" );
        socket.broadcast.emit( "userConnected", kUserId );
    }
    else
    {
        // With Render's server 2 connection attemps are done if the server asleep.
        if ( !DataModel.mapUserIdToLoginTime.has( kUserId )
            || Date.now() - DataModel.mapUserIdToLoginTime.get( kUserId ) > 4000 )
        {
            console.log( "Server.js :: onClientConnected() :: connectionRejected" );

            socket.emit( "connectionRejected", 0 );
        }
    }

    if ( !keepAliveTimer && !Config.isDebugMode )
    {
		console.log( "onClientConnected :: keep alive timer initialized." );
		pingServer();
        keepAliveTimer = setInterval( pingServer, 10 * 60 * 1000 );
    }
	
	function pingServer()
	{
		const kGetOptions = {
			host: "l5r-server.onrender.com",
			port: 80,
			path: "/"  };
		http.get( kGetOptions, function( res ) {
			res.on( "data", function( chunk ) {
				try 
				{
					// optional logging... disable after it's working
					console.log( "pingServer :: response: " + chunk );
				} 
				catch ( err ) 
				{
					console.log( err.message );
				}
			} );
		} ).on( "error", function( err ) {
			console.log( "pingServer :: error: " + err.message );
		} );
	};

    function onDisconnect( myUser, reason )
    {
        if ( myUser.gameId && DataModel.mapGameIdToGame.has( myUser.gameId ) )
        {
            let game = DataModel.mapGameIdToGame.get( myUser.gameId );
            game.onDisconnect( myUser );
            if ( game.isEmpty() )
            {
                // TODO: The game will be deleted if both players are disconnected :-/
                // It would be better if it waited for a short time (see CombatReconnector).

                DataModel.mapGameIdToGame.delete( myUser.gameId );
                console.log( "Game deleted: " + myUser.gameId );
            }
        }

        DataModel.mapUserIdToUser.delete( myUser.userId );
        DataModel.mapUserIdToLoginTime.delete( myUser.userId );
        socket.broadcast.emit( "userDisconnected", myUser.userId );
        console.log( "onDisconnect :: User disconnected: " + myUser.userId + " :: " + reason );

        if ( keepAliveTimer && DataModel.mapUserIdToUser.size == 0 )
        {
            clearInterval( keepAliveTimer );
            keepAliveTimer = null;
			console.log( "onDisconnect :: keep alive timer cleared." );
        }
    };

    function onTryGameReconnection( myUser, gameId )
    {
        console.log( "onTryGameReconnection :: ini :: " + gameId );
        let isInvalidated = !DataModel.mapGameIdToGame.has( gameId );
        let game = null;
        if ( !isInvalidated )
        {
            console.log( "onTryGameReconnection :: has" );
            game = DataModel.mapGameIdToGame.get( gameId );
            isInvalidated = game.isEmpty();
        }

        if ( !isInvalidated )
        {
            console.log( "onTryGameReconnection :: no empty" );
            game.onReconnect( myUser );

            ServiceLocator.gameEventManager.add( myUser );
            
            myUser.socket.emit( "gameResumed" );
            myUser.opponent.socket.emit( "gameResumed" );
        }
        else
        {
            myUser.socket.emit( "gameInvalidated" );
        }
    };
};

main();

// #endregion //