var assert = require("assert");

var dq = require("../index.js");

var sock = {
    path: "/tmp/dqueue.1232123122312.sock"
};

var server;

var isadd = function(wha) {
    it("should add", function(done) {
        server.add(wha, done);
    });
};

var isget = function(more, filt, test) {
    if (!filt) {
        filt = more;
        more = null;
    }
    if (!test) {
        test = filt;
        filt = more;
        more = null;
    }
    more = more || "should retrieve";
    it(more, function(done) {
        server.next(filt, function(data) {
            assert(data);
            if (test) {
                assert(test(data));
            }
            done();
        });
    });
};

var isntget = function(more, filt) {
    if (!filt) {
        filt = more;
        more = null;
    }
    more = more || "should not retrieve";
    it(more, function(done) {
        server.next(filt, function(data) {
            assert(!data);
            done();
        });
    });
};

describe("Listen", function() {
    it("should not fail", function(done) {
        dq.listen(sock, function(remote) {
            if (remote && !server) {
                server = remote;
                done();
            }
        });
    });
});

describe("Simple Queue", function() {
    isadd({
        name: "test"
    });
    isget(function(x) {
        return x.name === "test";
    });
});

describe("Less-simple Queue", function() {
    isadd({name: "foo",type: "geek"});
    isadd({name: "bar",type: "geek"});
    isadd({name: "football",type: "jock"});
    isadd({name: "beer",type: "jock"});
    isget(function(x) { return x.name === "foo"; });
    isget( { type: "jock" }, function(x) { return x.name === "football"; });
    isget( { type: "geek"}, function(x) {return x.name === "bar";});
    isntget( { type: "geek"} );
    isget( function(x) {return x.name === "beer"; }); 
});
