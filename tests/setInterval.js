var setTimeoutSuite = {};
setTimeoutSuite.oEvents = [];
setTimeoutSuite.callbacks = {};

suite(
  "setTimeout", 
  function()
  {
    setup(
      function()
      {
        return TestingFramework.loadScripts(
          [
            "../ClientScripts/Core.js", 
            "../ClientScripts/NIH/scriptaculous/lib/prototype.js", 
            "../ClientScripts/Utilities/TickWrapper.js"
          ]);
      });
    test(
      "function - success", 
      function(done)
      {
        var oEvents = [];
        var subscriberKey = Instrument.subscribe(
          "setInterval", 
          {
            register: 
              function()
              {
                oEvents.push("register");
              }, 
            before: 
              function()
              {
                oEvents.push("before");
              }, 
            success: 
              function()
              {
                oEvents.push("success");
              }, 
            error: 
              function()
              {
                oEvents.push("error");
              }
          });

        var interval = setInterval(
          function()
          {
            oEvents.push("callback");
          }, 
          100);
        setTimeout(
          function()
          {
            clearInterval(interval);

            setTimeout(
              function()
              {
                Instrument.unsubscribe(
                  "setInterval", 
                  {
                    success: subscriberKey
                  });
                assert.isTrue(["register","before","callback","success","before","callback","success"].equals(oEvents));
                done();
              }, 
              200);
          }, 
          250);
        
      });
    if (false)
    test(
      "function - error", 
      function(done)
      {
        var oEvents = [];
        var subscriberKey = Instrument.subscribe(
          "setTimeout", 
          {
            register: 
              function()
              {
                oEvents.push("register");
              }, 
            before: 
              function()
              {
                oEvents.push("before");
              }, 
            success: 
              function()
              {
                oEvents.push("success");
              }, 
            error: 
              function()
              {
                oEvents.push("error");
                Instrument.unsubscribe(
                  "setTimeout", 
                  {
                    success: subscriberKey
                  });
                assert.isTrue(["register","before","callback","error"].equals(oEvents));
                done();
              }
          });

        setTimeout(
          function()
          {
            oEvents.push("callback");
            foo.bar();
          }, 
          100);
      });

});
