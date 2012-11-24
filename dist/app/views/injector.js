define([
  'jquery'
], function($) {
  $("<style/>").html(
    [
      'path {stroke: #FFFFFF; stroke-width: 1px;}',
      '.hoverover {font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }',
      '.hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; }',
      '.hoverinfo hr {border:1px dotted #CCC; }'
    ].join('\n')
  ).prependTo('head');
});