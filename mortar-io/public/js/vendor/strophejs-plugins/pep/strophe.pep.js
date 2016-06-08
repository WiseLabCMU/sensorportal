// Generated by CoffeeScript 1.3.3
(function() {

  Strophe.addConnectionPlugin('pep', (function() {
    var conn, init, publish, subscribe, unsubscribe;
    conn = null;
    init = function(c) {
      conn = c;
      if (conn.caps === void 0) {
        throw new Error("caps plugin required!");
      }
      if (conn.pubsub === void 0) {
        throw new Error("pubsub plugin required!");
      }
    };
    subscribe = function(node, handler) {
      conn.caps.addFeature(node);
      conn.caps.addFeature("" + node + "+notify");
      conn.addHandler(handler, Strophe.NS.PUBSUB_EVENT, "message", null, null, null);
      return conn.caps.sendPres();
    };
    unsubscribe = function(node) {
      conn.caps.removeFeature(node);
      conn.caps.removeFeature("" + node + "+notify");
      return conn.caps.sendPres();
    };
    publish = function(node, items, callback) {
      var iqid;
      iqid = conn.getUniqueId("pubsubpublishnode");
      conn.addHandler(callback, null, 'iq', null, iqid, null);
      conn.send($iq({
        from: conn.jid,
        type: 'set',
        id: iqid
      }).c('pubsub', {
        xmlns: Strophe.NS.PUBSUB
      }).c('publish', {
        node: node,
        jid: conn.jid
      }).list('item', items).tree());
      return iqid;
    };
    return {
      init: init,
      publish: publish,
      subscribe: subscribe,
      unsubscribe: unsubscribe
    };
  })());

}).call(this);
