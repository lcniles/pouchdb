// Porting tests from Apache CouchDB bulk docs tests
// https://github.com/apache/couchdb/blob/master/share/www/script/test/bulk_docs.js

// Note: writing sync tests over an async api sucks, havent found a decent
// dataflow type library I like yet

module('conflicts', {
  setup : function () {
    this.name = 'idb://test_suite_db';
  }
});

asyncTest('Testing conflicts', function() {
  initTestDB(this.name, function(err, db) {
    var doc = {_id: 'foo', a:1, b: 1};
    db.put(doc, function(err, res) {
      doc._rev = res.rev;
      ok(res.ok);
      db.get('foo', function(err, doc2) {
        ok(doc._id === doc2._id && doc._rev && doc2._rev);
        doc.a = 2;
        doc2.a = 3;
        db.put(doc, function(err, res) {
          ok(res.ok);
          db.put(doc2, function(err) {
            ok(err.error === 'conflict');
            db.changes(function(err, results) {
              ok(results.results.length === 1);
              doc2._rev = undefined;
              db.put(doc2, function(err) {
                ok(err.error === 'conflict');
                start();
              });
            });
          });
        });
      });
    });
  });
});

asyncTest('Testing conflicts', function() {
  var doc = {_id: 'fubar', a:1, b: 1};
  Pouch(this.name, function(err, db) {
    db.put(doc, function(err, ndoc) {
      doc._rev = ndoc.rev;
      db.remove(doc, function() {
        delete doc._rev;
        db.put(doc, function(err, ndoc) {
          if (err) {
            ok(false);
            start();
            return;
          }
          ok(ndoc.ok, 'written previously deleted doc without rev');
          start();
        });
      });
    });
  });
});