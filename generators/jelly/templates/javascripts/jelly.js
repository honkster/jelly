/**
 *  Jelly. a sweet unobtrusive javascript framework for Rails
 *
 *  version 0.12.0
 *
 * Copyright (c) 2009 Pivotal Labs
 * Licensed under the MIT license.
 *
 *  * Date: 2009-07-20 9:50:50 (Mon, 20 Jul 2009)
 *
 */

(function () {
  if (!window.Jelly) window.Jelly = {};
  var Jelly = window.Jelly;
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (object) {
      var self = this;
      return function () {
        return self.apply(object, arguments);
      }
    }
  }
  var extend = function (destination, source) {
    for (var m in source) {
      if (source.hasOwnProperty(m)) {
        destination[m] = source[m];
      }
    }
    return destination;
  };
  extend(Jelly, {
    init:function () {
      this.observers = [];
      this.run = this.Observers.run;
      this.attach = this.Observers.attach;
      this.notifyObservers = this.Observers.notify;
      this.Pages.init();
    },

    Observers:{
      run:function () {
        if (this === Jelly) {
          return Jelly.Observers.run.apply(this.observers, arguments);
        }
        for (var i=0, len=arguments.length; i < len; i++) {
          var op = arguments[i];
          switch (op[0]) {
            case ("attach"):
              Jelly.Observers.runAttachOp.call(this, op);
              break;
            case ("notify"):
              Jelly.Observers.runNotifyOp.call(this, op);
              break;
          }

        }
      },

      runAttachOp:function (op) {
        if (op[0] !== "attach") {
          throw "op " + JSON.stringify(op) + " is not an attach op"
        }
        var args = [op[1]];
        args.concat.apply(args, op.slice(2));
        Jelly.Observers.attach.apply(this, args);
      },

      attach:function () {
        if (this === Jelly) {
          return Jelly.Observers.attach.apply(this.observers, arguments);
        }
        var component = Jelly.Observers.evaluateComponent(arguments[0]);
        var args = Array.prototype.slice.call(arguments, 1);
        if (component.init) {
          var initReturnValue = component.init.apply(component, args);
          if (initReturnValue === false || initReturnValue === null) {
          } else {
            Jelly.Observers.pushIfObserver.call(this, initReturnValue || component);
          }
        } else {
          Jelly.Observers.pushIfObserver.call(this, component);
        }
      },

      evaluateComponent:function (component) {
        return eval(component);
      },

      pushIfObserver:function (observer) {
        if (observer) {
          this.push(observer);
        }
      },

      runNotifyOp:function(op) {
        if (op[0] !== "notify") {
          throw "op " + JSON.stringify(op) + " is not a notify op"
        }
        var args = [op[1]];
        args.push.apply(args, op.slice(2));
        Jelly.Observers.notify.apply(this, args);
      },

      notify:function () {
        if (this === Jelly) {
          return Jelly.Observers.notify.apply(this.observers, arguments);
        }

        var observers = this.slice(0);
        var message = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        var instruction = [message];
        instruction.push.apply(instruction, args);
        for (var i = 0, len = observers.length; i < len; i++) {
          var observer = observers[i];
          Jelly.Observers.notifyObserver.call(this, observer, message, args);
          Jelly.Observers.notifyObserver.call(this, observer, 'on_notify', instruction);
        }
      },

      notifyObserver:function (observer, method, args) {
        if (observer[method]) {
          if (observer.detach && observer.detach()) {
            Jelly.Observers.garbageCollectObserver.call(this, observer);
          } else {
            observer[method].apply(observer, args);
          }
        }
      },

      notifying:false,

      garbageCollectObserver:function (observer) {
        var index = this.indexOf(observer);
        if (index > -1) {
          Jelly.Observers.remove.call(this, index, index + 1);
        }
      },

      remove:function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
      }
    },

    Pages:{
      init:function () {
        this.all = {};
        Jelly.all = this.all; // Deprecated
      },

      add:function (name) {
        var page = new Jelly.Page.Constructor(name);
        for (var i = 1; i < arguments.length; i++) {
          extend(page, arguments[i]);
        }
        return page;
      }
    },

    Page:{
      init:function (controllerName, actionName) {
        var page = Jelly.Pages.all[controllerName] || new Jelly.Page.Constructor(controllerName);
        window.page = page;
        if (page.all) page.all();
        if (page[actionName]) page[actionName].call(page);
        page.loaded = true;
        return page;
      },
      Constructor:function (name) {
        this.loaded = false;
        this.documentHref = Jelly.Location.documentHref;

        this.name = name;
        Jelly.Pages.all[name] = this;
      }
    },

    Location:{
      on_redirect:function (location) {
        this.window().top.location.href = location;
      },
      window:function () {
        return window;
      }
    }
  });
  Jelly.add = Jelly.Pages.add; // Deprecated

  Jelly.init();
})();
