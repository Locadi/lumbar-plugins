module.exports = function(options) {
  return {
    // plugin methods
    mode: 'static',
    priority: 1,
    resource: function(context, next, complete) {
      var resource = context.resource;
      
      if(resource['parse-variables']) {
        next(function(err, resource) {
          function generator(context, callback) {
            // Load the source data
            context.loadResource(resource, function(err, file) {
              if (err) {
                return complete(err);
              }
  
              // Update the content
              var data = file.content.toString();
              for(var key in resource) {
                data = data.replace('{'+key+'}', resource[key]);
              }
              
              callback(err, {
                data: data,
                inputs: file.inputs
              });
            });
          }
          
          // Include any attributes that may have been defined on the base entry
          if (typeof resource !== 'string' && ! (resource instanceof String)) {
            for (var prop in resource) {
              generator[prop] = resource[prop];
            }
          }
          complete(undefined, generator);
        });
      } else {
        next(complete);
      }
    }
  };
};