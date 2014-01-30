var sock = ("dnode.sock");
var fs = require("fs");
var async = require('async');

process.on( 'SIGINT', function() {
  fs.unlink(sock);
  process.exit( );
})

var dnode = require('dnode');

var filter_match = function(q,filt) {
  for (var key in q) {
    if (filt.hasOwnProperty(key)) {
      val = filt[key];
      if(q[key] !== filt[key]) {
        return false;
      }
    }
  }
  return true;
}

var queue = [];
var qserv = dnode({
  add: function(item,cb) {
    queue.push(item);
//    console.log("NEWQ " + JSON.stringify(queue));
    cb();    
  },
  length: function(cb) {
    cb(queue.length);
  },
  next: function(filter,cb) {
    if(!cb) {
      cb = filter;      
      filter = null;
    }
    if(!queue.length) {
      console.log("NULL CUZ QUEUELEN");
      return cb(null);
    }
    if(filter && Object.keys(filter).length ) {
      var i;
      for(i = 0; i < queue.length; ++i) {
        if(filter_match(queue[i],filter)) {
            var rval = queue[i];
            queue.splice(i--,1);
            return cb(rval);
        }
      }
      console.log("NULL CUZ FILTER + " + JSON.stringify(filter));
      return cb(null);
    }    
    var rval = queue[0];
    queue.shift();
    return cb(rval);
  },
  hi: function(a,cb) {
    cb("hi " + a + "\n");
  }
});

module.exports = {
  listen: function(d,p,cb) {
    qserv.listen(d,p);
    var dcl = dnode.connect(d,p);
    if(cb) { dcl.on('remote',cb) };
    return dcl;
  },


};

