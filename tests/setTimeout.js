var setTimeoutTests = {};

debugger;
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

    testSuccess(
      "function - success", 
      function()
      {
        setTimeoutTests.oEvents.push("callback");
      });
    testSuccess(
      "eval - success", 
      "setTimeoutTests.oEvents.push(\"callback\")");
    testFailure(
      "function - failure", 
      function()
      {
        setTimeoutTests.oEvents.push("callback");
        foo.bar();
      });
    testFailure(
      "eval - failure", 
      "setTimeoutTests.oEvents.push(\"callback\");foo.bar();");
    testCancelable();

    function testSuccess(testName, methodArg)
    {
      test(
        testName, 
        function(done)
        {
          setTimeoutTests.oEvents = [];
          var subscriberKey = Instrument.subscribe(
            "setTimeout", 
            {
              register: 
                function()
                {
                  setTimeoutTests.oEvents.push("register");
                }, 
              before: 
                function()
                {
                  setTimeoutTests.oEvents.push("before");
                }, 
              success: 
                function()
                {
                  setTimeoutTests.oEvents.push("success");
                  Instrument.unsubscribe(subscriberKey);
                  assert.isTrue(["register","before","callback","success"].equals(setTimeoutTests.oEvents));
                  done();
                }, 
              error: 
                function()
                {
                  setTimeoutTests.oEvents.push("error");
                }
            });

          setTimeout(methodArg, 100);
        });
    }
    function testFailure(testName, methodArg)
    {
      test(
        testName, 
        function(done)
        {
          setTimeoutTests.oEvents = [];
          var subscriberKey = Instrument.subscribe(
            "setTimeout", 
            {
              register: 
                function()
                {
                  setTimeoutTests.oEvents.push("register");
                }, 
              before: 
                function()
                {
                  setTimeoutTests.oEvents.push("before");
                }, 
              success: 
                function()
                {
                  setTimeoutTests.oEvents.push("success");
                }, 
              error: 
                function()
                {
                  setTimeoutTests.oEvents.push("error");
                  Instrument.unsubscribe(subscriberKey);
                  assert.isTrue(["register","before","callback","error"].equals(setTimeoutTests.oEvents));
                  done();
                }
            });

          setTimeout(methodArg, 100);
        });
    }
    function testCancelable()
    {
      test(
        "cancelable", 
        function(done)
        {
          setTimeoutTests.oEvents = [];
          var subscriberKey = Instrument.subscribe(
            "setTimeout", 
            {
              register: 
                function()
                {
                  setTimeoutTests.oEvents.push("register");
                }, 
              before: 
                function()
                {
                  setTimeoutTests.oEvents.push("before");
                }, 
              success: 
                function()
                {
                  setTimeoutTests.oEvents.push("success");
                }, 
              error: 
                function()
                {
                  setTimeoutTests.oEvents.push("error");
                }
            });

          var i = setTimeout(
            function()
            {
              setTimeoutTests.oEvents.push("callback");
            }, 
            100);
          clearTimeout(i);
          Instrument.unsubscribe(subscriberKey);

          setTimeout(
            function()
            {
              assert.isTrue(["register"].equals(setTimeoutTests.oEvents));
              done();
            }, 
            200);
        });
    }

});
