/*
 * Copyright (c) 2012 Camille Reynders
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

/*global phantom:true*/

/*
 arguments:
 0 -> tempfile
 1 -> jasmine helper file
 2 -> spec html file
 */

var fs = require( 'fs' );

// The temporary file used for communications.
var tmpfile = phantom.args[0];

// The Jasmine helper file to be injected.
var jasmineHelper = phantom.args[1];

// The Jasmine .html specs file to run.
var url = phantom.args[2];

//in milliseconds
var timeout = phantom.args[ 3 ];

// Keep track of the last time a Jasmine message was sent.
var last = new Date();

// Messages are sent to the parent by appending them to the tempfile.
function sendMessage( args ){
    last = new Date();
    fs.write( tmpfile, JSON.stringify( args ) + '\n', 'a' );
    // Exit when all done.
    if( /^done/.test( args[0] ) ){
        phantom.exit();
    }
}

// Send a debugging message.
function sendDebugMessage(){
    sendMessage( ['debug'].concat( [].slice.call( arguments ) ) );
}

// Abort if Jasmine doesn't do anything for a while.
setInterval( function(){
    if( new Date() - last > timeout ){
        sendMessage( ['done_timeout'] );
    }
}, 1000 );

// Create a new page.
var page = require( 'webpage' ).create();


// Jasmine sends its messages via alert(jsonstring);
page.onAlert = function( args ){
    sendMessage( JSON.parse( args ) );
};

// Keep track if Jasmine has been injected already.
var injected;

const INJECT_MESSAGE = 'inject';

function doInjection(){
    if( injected ){
        return;
    }
    injected = true;
    // Inject Jasmine helper file.
    sendDebugMessage( 'inject', jasmineHelper );
    page.injectJs( jasmineHelper );
}

// Additional message sending
page.onConsoleMessage = function( message ){
    if( message == INJECT_MESSAGE ){
        doInjection();
    }else{
        sendMessage( ['console', message] );
    }
};
page.onResourceRequested = function( request ){
    if( /\/jasmine\.js$/.test( request.url ) ){
        // Reset injected to false, if for some reason a redirect occurred and
        // the test page (including jasmine.js) had to be re-requested.
        injected = false;
    }
    sendDebugMessage( 'onResourceRequested', request.url );
};
page.onResourceReceived = function( request ){
    if( request.stage === 'end' ){
        sendDebugMessage( 'onResourceReceived', request.url );
    }
};
page.onInitialized = function() {
    sendDebugMessage( 'page.onInitialized' );
    page.evaluate(function(domContentLoadedMsg) {
        document.addEventListener('DOMContentLoaded', function() {
            console.log(domContentLoadedMsg);
        }, false);
    }, INJECT_MESSAGE );
}

page.open( url, function( status ){
    sendDebugMessage( 'page.open' )
    // The window has loaded.
    if( status !== 'success' ){
        // File loading failure.
        sendMessage( ['done_fail', url] );
    }else{
        // Because injection happens after window load, "begin" must be sent
        // manually.
        sendMessage( ['begin'] );
    }
} );
