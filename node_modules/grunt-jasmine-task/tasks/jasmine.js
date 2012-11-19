/*
 * Copyright (c) 2012 Camille Reynders
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

module.exports = function( grunt ){

    // Nodejs libs.
    var fs = require( 'fs' );
    var path = require( 'path' );

    // External libs.
    var Tempfile = require( 'temporary/lib/file' );

    var status;
    var errorReporting = false;

    // Allow an error message to retain its color when split across multiple lines.
    function formatMessage( str ){
        return String( str ).split( '\n' ).map(
            function( s ){
                return s.magenta;
            } ).join( '\n' );
    }

    // Handle methods passed from PhantomJS, including Jasmine hooks.
    var phantomHandlers = {
        begin : function(){

        },
        testDone : function( suite, name, totalAssertions, passedAssertions, failedAssertions, skippedAssertions ){
            status.specs++;
            status.failed += failedAssertions;
            status.passed += passedAssertions;
            status.total += totalAssertions;
            status.skipped += skippedAssertions;
            
            var testName = suite + ' : ' + name + '...';
            if( grunt.option( 'verbose' ) ){
	            grunt.log.write( testName );
	            if( failedAssertions > 0 ){
                    grunt.log.error();
	            }else if( skippedAssertions > 0 ){
                    grunt.log.warn();
	            }else{
	            	grunt.log.ok();
	            }
            }else{
	            if( failedAssertions > 0 ){
	            	if( errorReporting ){
			            grunt.log.write( testName.red );
			            grunt.log.error();
	            	}else{
	                    grunt.log.write( 'F'.red );
	                }
	            }else if( skippedAssertions > 0 ){
                    grunt.log.write( '*'.red );
	            }else{
	            	grunt.log.write( '.'.green );
	            }
            }
        },
        done : function( elapsed ){
            status.duration = elapsed;
        },
        // Error handlers.
        done_fail : function( url ){
            grunt.verbose.write( 'Running PhantomJS...' ).or.write( '...' );
            grunt.log.error();
            grunt.warn( 'PhantomJS unable to load "' + url + '" URI.', 90 );
        },
        done_timeout : function(){
            grunt.log.writeln();
            grunt.warn( 'PhantomJS timed out, possibly due to an unfinished async spec.', 90 );
        },
        // console.log pass-through.
        console : console.log.bind( console ),
        // Debugging messages.
        debug : grunt.log.debug.bind( grunt.log, 'phantomjs' )
    };

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerMultiTask( 'jasmine', 'Run Jasmine specs in a headless PhantomJS instance.', function(){
        var timeout = grunt.config( ['jasmine', this.target, 'timeout'] );
        if( typeof timeout === "undefined" ){
            timeout = 10000;
        }
        
        errorReporting = !!grunt.config( [ 'jasmine', this.target, 'errorReporting' ] );

        // Get files as URLs.
        var urls = grunt.file.expandFileURLs( this.file.src );

        // This task is asynchronous.
        var done = this.async();

        // Reset status.
        status = {failed : 0, passed : 0, total : 0, skipped : 0, specs : 0, duration : 0};

        // Process each filepath in-order.
        grunt.utils.async.forEachSeries( urls, function( url, next ){
            var basename = path.basename( url );
            grunt.verbose.subhead( 'Running specs for ' + basename ).or.write( 'Running specs for ' + basename );
            grunt.log.writeln();

            // Create temporary file to be used for grunt-phantom communication.
            var tempfile = new Tempfile();
            // Timeout ID.
            var id;
            // The number of tempfile lines already read.
            var n = 0;

            // Clean up.
            function cleanup(){
                clearTimeout( id );
                tempfile.unlink();
            }

            // It's simple. As Jasmine tests, assertions and modules begin and complete,
            // the results are written as JSON to a temporary file. This polling loop
            // checks that file for new lines, and for each one parses its JSON and
            // executes the corresponding method with the specified arguments.
            (function loopy(){
                // Disable logging temporarily.
                grunt.log.muted = true;
                // Read the file, splitting lines on \n, and removing a trailing line.
                var lines = grunt.file.read( tempfile.path ).split( '\n' ).slice( 0, -1 );
                // Re-enable logging.
                grunt.log.muted = false;
                // Iterate over all lines that haven't already been processed.
                var done = lines.slice( n ).some( function( line ){
                    // Get args and method.
                    var args = JSON.parse( line );
                    var method = args.shift();
                    // Execute method if it exists.
                    if( phantomHandlers[method] ){
                        phantomHandlers[method].apply( null, args );
                    }
                    // If the method name started with test, return true. Because the
                    // Array#some method was used, this not only sets "done" to true,
                    // but stops further iteration from occurring.
                    return (/^done/).test( method );
                } );

                if( done ){
                    // All done.
                    grunt.log.writeln();
                    cleanup();
                    next();
                }else{
                    // Update n so previously processed lines are ignored.
                    n = lines.length;
                    // Check back in a little bit.
                    id = setTimeout( loopy, 100 );
                }
            }());

            // Launch PhantomJS.
            grunt.helper( 'phantomjs', {
                code : 90,
                args : [
                    // The main script file.
                    grunt.task.getFile( 'jasmine/phantom-jasmine-runner.js' ),
                    // The temporary file used for communications.
                    tempfile.path,
                    // The Jasmine helper file to be injected.
                    grunt.task.getFile( 'jasmine/jasmine-helper.js' ),
                    // URL to the Jasmine .html test file to run.
                    url,
                    timeout,
                    // PhantomJS options.
                    '--config=' + grunt.task.getFile( 'jasmine/phantom-config.json' )
                ],
                done : function( err ){
                    if( err ){
                        cleanup();
                        done();
                    }
                }
            } );
        }, function( err ){
            // All tests have been run.
            // Log results.
            if( status.failed > 0 ){
                grunt.warn( status.failed + '/' + status.total + ' assertions failed in ' + status.specs + ' specs (' +
                                status.duration + 'ms)', Math.min( 99, 90 + status.failed ) );
            }else if( status.skipped > 0 ){
                grunt.warn( status.skipped + '/' + status.total + ' assertions skipped in ' + status.specs + ' specs (' +
                                status.duration + 'ms)', Math.min( 99, 90 + status.skipped ) );
            }else{
                grunt.verbose.writeln();
                grunt.log.ok( status.total + ' assertions passed in ' + status.specs + ' specs (' + status.duration + 'ms)' );
            }

            // All done!
            done();
        } );
    } );

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    grunt.registerHelper( 'phantomjs', function( options ){
        return grunt.utils.spawn( { cmd : 'phantomjs', args : options.args }, function( err, result, code ){
            if( !err ){
                return options.done( null );
            }
            // Something went horribly wrong.
            grunt.verbose.or.writeln();
            grunt.log.write( 'Running PhantomJS...' ).error();
            if( code === 127 ){
                grunt.log.errorlns(
                    'In order for this task to work properly, PhantomJS must be ' +
                        'installed and in the system PATH (if you can run "phantomjs" at' +
                        ' the command line, this task should work). Unfortunately, ' +
                        'PhantomJS cannot be installed automatically via npm or grunt. ' +
                        'See the grunt FAQ for PhantomJS installation instructions: ' +
                        'https://github.com/cowboy/grunt/blob/master/docs/faq.md'
                );
                grunt.warn( 'PhantomJS not found.', options.code );
            }else{
                result.split( '\n' ).forEach( grunt.log.error, grunt.log );
                grunt.warn( 'PhantomJS exited unexpectedly with exit code ' + code + '.', options.code );
            }
            options.done( code );
        } );
    } );

};
