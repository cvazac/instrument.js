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
            "../ClientScripts/Utilities/TickWrapper.js"
          ]);
      });
    setup(
      function()
      {
        Instrument.subscribe(
          "setTimeout", 
          {
            register: 
              function()
              {
                setTimeoutSuite.oEvents.push("register");
              }, 
            before: 
              function()
              {
                setTimeoutSuite.oEvents.push("before");
              }, 
            success: 
              function()
              {
                setTimeoutSuite.oEvents.push("success");
                setTimeoutSuite.callbacks && setTimeoutSuite.callbacks["success"] && setTimeoutSuite.callbacks["success"]();
              }, 
            error: 
              function()
              {
                setTimeoutSuite.oEvents.push("error");
                setTimeoutSuite.callbacks && setTimeoutSuite.callbacks["error"] && setTimeoutSuite.callbacks["error"]();
              }
          });
      });
    test(
      "function - success", 
      function()
      {
        return {
            then: 
              function(fnSuccess, fnFailure)
              {
                setTimeoutSuite.oEvents = [];
                setTimeoutSuite.callbacks["success"] = 
                  function()
                  {
                    delete setTimeoutSuite.callbacks["success"];
                    TestingFramework.compareArrays(
                      setTimeoutSuite.oEvents, 
                      ["register","before","callback","success"], 
                      fnSuccess, 
                      fnFailure);
                  };
                setTimeout(
                  function()
                  {
                    setTimeoutSuite.oEvents.push("callback");
                  }, 
                  100);
              }
          };
      });
    test(
      "function - error", 
      function()
      {
        return {
            then: 
              function(fnSuccess, fnFailure)
              {
                setTimeoutSuite.oEvents = [];
                setTimeoutSuite.callbacks["error"] = 
                  function()
                  {
                    if (setTimeoutSuite.oEvents.equals(["register","before","callback","error"]))
                      fnSuccess();
                    else
                      fnFailure();
                  };
                setTimeout(
                  function()
                  {
                    setTimeoutSuite.oEvents.push("callback");
                    foo.bar();
                  }, 
                  100);
              }
          };
      });
    if (false)
    test(
      "eval - success", 
      function()
      {
        return {
            then: 
              function(fnSuccess, fnFailure)
              {
                setTimeoutSuite.oEvents = [];
                setTimeoutSuite.callbacks["success"] = 
                  function()
                  {
                    delete setTimeoutSuite.callbacks["success"];
                    TestingFramework.compareArrays(
                      setTimeoutSuite.oEvents, 
                      ["register","before","callback","success"], 
                      fnSuccess, 
                      fnFailure);
                  };
                setTimeout(
                  "setTimeoutSuite.oEvents.push(\"callback\");", 
                  100);
              }
          };
      });
    if (false)
    test(
      "eval - error", 
      function()
      {
        return {
            then: 
              function(fnSuccess, fnFailure)
              {
                setTimeoutSuite.oEvents = [];
                setTimeoutSuite.callbacks["error"] = 
                  function()
                  {
                    delete setTimeoutSuite.callbacks["error"];
                    TestingFramework.compareArrays(
                      setTimeoutSuite.oEvents, 
                      ["register","before","callback","error"], 
                      fnSuccess, 
                      fnFailure);
                  };
                setTimeout(
                  "setTimeoutSuite.oEvents.push(\"callback\");foo.bar()", 
                  100);
              }
          };
      });

});
