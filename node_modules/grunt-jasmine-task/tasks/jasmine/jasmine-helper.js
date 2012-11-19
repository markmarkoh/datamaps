/*
 * Is injected into the spec runner file

 * Copyright (c) 2012 Camille Reynders
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

/*global jasmine:true, alert:true*/

// Send messages to the parent phantom.js process via alert! Good times!!
function sendMessage(){
    var args = [].slice.call( arguments );
    alert( JSON.stringify( args ) );
}

var GruntReporter = function(){
    this._started = this._getTime();
};
GruntReporter.prototype = {
    _getTime : function(){
        return new Date().getTime();
    },
    /**
     * @param {jasmine.Suite} suite
     */
    _getSuitesToRoot : function( suite ){
        var result = [];
        do{
            result.unshift( suite.description );
            suite = suite.parentSuite;
        }while( suite );
        return result;
    },
    /**
     * @param {jasmine.Suite} suite
     */
    reportRunnerResults : function( runner ){
        var elapsed = this._getTime() - this._started;
        sendMessage( 'done', elapsed );
    },
    /**
     *
     * @param {jasmine.Spec} spec
     */
    reportSpecResults : function( spec ){
        var results = spec.results();
        var suites = this._getSuitesToRoot( spec.suite );
        sendMessage( 'testDone', suites.join( ' ' ), spec.description, results.totalCount, results.passedCount, results.failedCount, results.skipped );
    }
};

jasmine.getEnv().addReporter( new GruntReporter() );