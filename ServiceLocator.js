"use strict";

const TimeoutManager = require( "./service/TimeoutManager" );
const CombatReconnector = require( "./service/CombatReconnector" );
const GatewayEventManager = require( "./service/GatewayEventManager" );
const GameEventManager = require( "./service/GameEventManager" );


function ServiceLocator() {}
module.exports = ServiceLocator;


//===================================================
// Attributes
//===================================================

/**
 * @type {TimeoutManager}
 * @static
 * @const
 */
ServiceLocator.timeoutManager = null;

/**
 * @type {CombatReconnector}
 * @static
 * @const
 */
ServiceLocator.combatReconnector = null;

/**
 * @type {GatewayEvetManager}
 * @static
 * @const
 */
ServiceLocator.gatewayEventManager = null;

/**
 * @type {GameEventManager}
 * @static
 * @const
 */
ServiceLocator.gameEventManager = null;

/**
 * @type {socket.io}
 * @static
 * @const
 */
ServiceLocator.io = null;


//===================================================
// Methods
//===================================================

/**
 * @type {void}
 * @static
 */
ServiceLocator.init = function()
{
	ServiceLocator.timeoutManager = new TimeoutManager();
	ServiceLocator.timeoutManager.init();

	ServiceLocator.combatReconnector = new CombatReconnector();
	// IMPORTANT: Avoid circular references!
	ServiceLocator.combatReconnector.timeoutManager = ServiceLocator.timeoutManager;
	ServiceLocator.combatReconnector.init();

	ServiceLocator.gameEventManager = new GameEventManager();
	ServiceLocator.gameEventManager.init();

	ServiceLocator.gatewayEventManager = new GatewayEventManager();
	// IMPORTANT: Avoid circular references!
	ServiceLocator.gatewayEventManager.gameEventManager = ServiceLocator.gameEventManager;
	ServiceLocator.gatewayEventManager.init();
};

/**
 * @type {void}
 * @static
 */
ServiceLocator.end = function()
{
	ServiceLocator.timeoutManager.end();
	ServiceLocator.timeoutManager = null;

	ServiceLocator.combatReconnector.end();
	ServiceLocator.combatReconnector = null;

	ServiceLocator.gatewayEventManager.end();
	ServiceLocator.gatewayEventManager = null;

	ServiceLocator.gameEventManager.end();
	ServiceLocator.gameEventManager = null;
};