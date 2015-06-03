var Instrument = {
    subscriberKey: 0
  };
Instrument.subscribe = function(type, subscribers)
{
  var subscriberKey = ++Instrument.subscriberKey;
  Instrument.listeners = Instrument.listeners || {};
  Instrument.listeners[type] = Instrument.listeners[type] || {};
  for (var eventType in subscribers)
  {
    Instrument.listeners[type][eventType] = Instrument.listeners[type][eventType] || {};
    Instrument.listeners[type][eventType][subscriberKey] = subscribers[eventType];
  }
  return subscriberKey;
}

Instrument.unsubscribe = function(subscriberKey)
{
  for (var type in Instrument.listeners)
    for (var eventType in Instrument.listeners[type])
      delete Instrument.listeners[type][eventType][subscriberKey];
}

;(function()
  {
    if (window.__wrapped === true)
      return;
    window.__wrapped = true;

    var strDataAttr = "data-wrapped";
    var oCurrentTick;
    wrapHandlerByArg(window, "setTimeout", 0, 
      {
        beforeWrap: 
          function(oTick, oArgs)
          {
            oTick.type = "setTimeout";
            oTick.millis = oArgs[1];
            checkEval(oArgs);
          }
      });
    wrapHandlerByArg(window, "setInterval", 0, 
      {
        beforeWrap: 
          function(oTick, oArgs)
          {
            oTick.type = "setInterval";
            oTick.millis = oArgs[1];
            checkEval(oArgs);
          }
      });
    wrapHandlerByArg(window, "requestAnimationFrame", 0, 
      {
        beforeWrap: 
          function(oTick, oArgs)
          {
            oTick.type = "requestAnimationFrame";
          }    
      });
    wrapEventListener();
    //wrapXHR();
    //wrapMutation();
    //runTests();

    function wrapMutation()
    {

      (function()
          {
        var target = document.querySelector('#userName');
        
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          debugger;
          mutations.forEach(function(mutation) {
            //console.log(mutation.type);
          });    
        });
         
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };
         
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
        
          }).delay(1)
      
   
   
   return;
   // create an observer instance
   var observer = new MutationObserver(
     function(mutations)
     {debugger;
     });

   observer.observe(
     document.querySelector("#userName"), 
     {
       attributes: true, 
       childList: true, 
       characterData: true, 
       subtree: true, 
       attributeOldValue: true, 
       characterDataOldValue: true, 
       attributeFilter: true
     });
   
   alert(1);
    
   //observer.disconnect();

   var div = document.createElement("div");
   document.body.appendChild(div);

   
      
    }
    function wrapXHR()
    {
      //TODO
    }
    function wrapEventListener()
    {
      function doWrap(oContext)
      {
        wrapHandlerByArg(oContext, "addEventListener", 1, 
          {
            beforeWrap: 
              function(oTick, oArgs)
              {
                oTick.type = "addEventListener[" + oArgs[0] + "]";
                if (this != window)
                {
                  oTick.anchor = {
                      tagName: this.tagName, 
                      nodeType: this.nodeType
                    };
                }
              }, 
            afterWrap:
              function(fnWrapped, strEventName, fnOrig, bCapture)
              {
                this[strDataAttr] = this[strDataAttr] || {};
                this[strDataAttr][strEventName] = this[strDataAttr][strEventName] || {};
                this[strDataAttr][strEventName][fnOrig] = fnWrapped;
              }
          });

          oContext["__native"  + "removeEventListener"] = oContext["removeEventListener"];
          oContext["removeEventListener"] = 
            function()
            {
              var strEventName = arguments[0];
              var fnOrig = arguments[1];
              if (this[strDataAttr] && this[strDataAttr][strEventName] && this[strDataAttr][strEventName][fnOrig])
              {
                arguments[1] = this[strDataAttr][strEventName][fnOrig];
                delete this[strDataAttr][strEventName][fnOrig];
              }
              return oContext["__native" + "removeEventListener"].apply(
                this, 
                arguments);
            };          
      }

      doWrap(EventTarget.prototype); //handles window and Element.prototype
    }
    function wrapHandlerByArg(oContext, strMethod, iFunctionArg, fnHandlers)
    {
      oContext["__native"  + strMethod] = oContext[strMethod];
      oContext[strMethod] = 
        function()
        {
          function wrapHandler(fnHandler)
          {
            return function()
            {
              notify(this, arguments, "before");
              try
              {
                fnHandler.apply(this, arguments);
              }
              catch(e)
              {
                notify(this, arguments, "error");
                throw e;
              }
              notify(this, arguments, "success");
            }
          }
          function notify(context, args, eventType)
          {if ("addEventListener" == strMethod)
            console.log("notify:" + eventType);
            if (!Instrument.listeners || 
              !Instrument.listeners[strMethod] || 
              !Instrument.listeners[strMethod][eventType])
            {
              return;
            }

            for (var uid in Instrument.listeners[strMethod][eventType])
            {
              try
              {
                Instrument.listeners[strMethod][eventType][uid].apply(context, args);
              } catch(e) {};
            }
          }
          function beforeTick(oRegisterArgs)
          {
            oTick.start = now();
            fnHandlers.exec && fnHandlers.exec(oTick, oRegisterArgs);
            if (oCurrentTick)
              oCurrentTick.nextTick = oTick;
            oCurrentTick = oTick;
            return oTick;
          }
          function successTick(oTickArgs)
          {
            oTick.sucess = now();
            debugTick("success:");
            oCurrentTick = null;
          }
          function errorTick(oTickArgs, e)
          {
            oTick.error = now();
            oTick.e = e;
            debugTick("error:");
            oCurrentTick = null;
          }
          function now()
          {
            return Date.now();
          }
          function debugTick(str)
          {
            function readObject(o, level)
            {
              if (level == undefined) level = 0;
              var indent = "";
              for (var i = 0; i < level; i++)
                indent += "  ";

              var str = "";
              for (var a in o)
              {
                str += indent + a + ":";
                str += typeof o[a] == "object" ? 
                  "\n" + readObject(o[a], ++level) + "\n" : 
                  o[a] + "\n";
              }
              str = str.substring(0, str.length - 1);
              return str;
            }

            str = str || "";
            str += readObject(oTick);
            //console.log(str);
          }

          notify(oContext, arguments, "register");
          var oArgs = Array.prototype.slice.call(arguments);
          var oTick = {};
          oTick.register = now();

          if (fnHandlers.beforeWrap)
            fnHandlers.beforeWrap.call(this, oTick, oArgs);
          debugTick();

          var fnWrapped = wrapHandler(oArgs[iFunctionArg]);

          if (fnHandlers.afterWrap)
          {
            var oWrapArgs = Array.prototype.slice.call(arguments);
            oWrapArgs.splice(0, 0, fnWrapped);
            fnHandlers.afterWrap.apply(this, oWrapArgs);
          }

          oArgs[iFunctionArg] = fnWrapped;
          return oContext["__native" + strMethod].apply(
            this, 
            oArgs);
        };
    }
    function checkEval(oArgs)
    {
      if (typeof oArgs[0] == "string")
      {
        var strEval = oArgs[0];
        oArgs[0] = 
          function()
          {
            eval(strEval);
          };
      }
    }
    function runTests()
    {
      //testIntervalTimeout();
      //testRequestAnimationFrame();
      testPostMessage();
      //testAddEventListener();

      function testIntervalTimeout()
      {
        setTimeout(
          "//console.log(\"setTimeout eval\");", 
          500);

        var fn1 = setInterval(
          function()
          {//console.log("setInterval");
          }, 
          100);
        setTimeout(
          function()
          {
            //console.log("setTimeout fn");
            clearInterval(fn1);
          }, 
          500);
      }
      function testRequestAnimationFrame()
      {
        requestAnimationFrame(
          function()
          {//console.log("requestAnimationFrame");
          });
      }
      function testPostMessage()
      {
        var fn1 = function(e)
        {
          console.log(e.data);
        }
        window.addEventListener("message", fn1);
        window.postMessage(
          {x: 1, y: 2}, 
          "*");

        if (true)
        {
          setTimeout(
            function()
            {
              window.removeEventListener("message", fn1);
              window.postMessage(
                {x: 3, y: 4}, 
                "*");
            });
        }
      }
      function testAddEventListener()
      {
        setTimeout(
          function()
          {
            var fn1 = function()
            {
              //console.log("keypress1");
            }
            var fn2 = function()
            {
              //console.log("keypress2");
            }

            if (!$("userName"))
              return;

            $("userName").addEventListener(
              "keypress", 
              fn1);
            $("userName").addEventListener(
              "keypress", 
              fn2);
  
            setTimeout(
              function()
              {
                $("userName").removeEventListener(
                  "keypress", 
                  fn1);
                $("userName").removeEventListener(
                  "keypress", 
                  fn2);
              }, 
              5000);
          }, 
          1000);
      }
    }
  })();






//ie
//xhr
/*


a.href = "javascript:foo.bar()";

<div onclick=""/>

dommutation, inserted nodes
<script>

can script nodes throw onerror

*/