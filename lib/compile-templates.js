var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var compiledTemplates = {
    
};

function writeCompiledTemplates(targetFile, cb) {
  var data = 'define([\'underscore\', \'templates\'], function(_, Templates) {';
  for(var templateId in compiledTemplates[targetFile]) {
    data += '\n  Templates.cache[\''+templateId+'\'] = '+compiledTemplates[targetFile][templateId]+';';
  }
  data += '\n});';
  fs.writeFile(targetFile, data, cb);
}

module.exports = function(options) {
  return {
    // plugin methods
    mode: 'static',
    priority: 1,
    resource: function(context, next, complete) {
      var resource = context.resource;
      
      if(resource['compile-templates'] && resource.src) {
//        var targetFile = path.resolve(context.config.outdir, resource['compile-templates']);
        var targetFile = resource['compile-templates'];
        if(!compiledTemplates[targetFile]) {
          compiledTemplates[targetFile] = {};
        }
        
        fs.readFile(resource.src, function(err, buffer) {
          if(err) return next(err);
          
          var compiledSource = _.template(buffer.toString()).source;
          var templateId = resource.src.slice(resource.srcDir.length+1, -5);
          compiledTemplates[targetFile][templateId] = compiledSource;
          
          writeCompiledTemplates(targetFile, function() {
            if(err) return next(err);
            next(complete);
          });
        });
      } else {
        return next(complete);
      }
    }
  };
};