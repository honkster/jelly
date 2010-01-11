/**
 *  Jelly. a sweet unobtrusive javascript framework
 *  for jQuery and Rails
 *
 *  version 0.8.11
 *
 * Copyright (c) 2009 Pivotal Labs
 * Licensed under the MIT license.
 *
 *  * Date: 2009-07-20 9:50:50 (Mon, 20 Jul 2009)
 *
 */

if (!window.Jelly) Jelly = new Object();
if (!Function.prototype.bind) {
  Function.prototype.bind = function(object) {
    var self = this;
    return function() {
      return self.apply(object, arguments);
    }
  }
}
$.extend(Jelly, {
  init: function() {
    this.observers = [];
    this.attach = this.Observers.attach;
    this.notifyObservers = this.Observers.notify;
    this.Pages.init();
  },

  Observers: {
    attach: function() {
      if (this == Jelly) {
        return Jelly.Observers.attach.apply(this.observers, arguments);
      }
      for (var i = 0; i < arguments.length; i++) {
        var definitionOrComponent = arguments[i];
        if (definitionOrComponent.component) {
          var component = Jelly.Observers.evaluateComponent(definitionOrComponent.component);
          if (component.init) {
            var initReturnValue = component.init.apply(component, definitionOrComponent.arguments);
            if (initReturnValue === false || initReturnValue === null) {
            } else {
              Jelly.Observers.pushIfObserver.call(this, initReturnValue || component);
            }
          } else {
            Jelly.Observers.pushIfObserver.call(this, component);
          }
        } else {
          Jelly.Observers.pushIfObserver.call(this, Jelly.Observers.evaluateComponent(definitionOrComponent));
        }
      }
    },

    evaluateComponent: function(component) {
      return eval(component);
    },

    pushIfObserver: function(observer) {
      if (observer) {
        this.push(observer);
      }
    },

    notify: function(instructions) {
      if (this == Jelly) {
        return Jelly.Observers.notify.apply(this.observers, arguments);
      }
      if (!$.isArray(instructions)) {
        instructions = [instructions];
      }

      var pristineObservers = this.slice(0);
      var observers;
      for (var i = 0; i < instructions.length; i++) {
        var instruction = instructions[i];

        // Deprecate 'on' in favor of making each page action a Component.
        if (instruction.on) {
          observers = [eval(instruction.on)];
        } else {
          observers = pristineObservers;
        }

        if (instruction.method) {
          for (var j = 0; j < observers.length; j++) {
            var observer = observers[j];
            if (observer[instruction.method]) {
              if (observer.detach && observer.detach()) {
                Jelly.Observers.garbageCollectObserver.call(this, observer);
              } else {
                observer[instruction.method].apply(observer, instruction.arguments);
              }
            }
          }
        }

        if (instruction.attach) {
          Jelly.Observers.attach.apply(this, instruction.attach);
        }
      }
    },

    garbageCollectObserver: function(observer) {
      var index = this.indexOf(observer);
      if (index > -1) {
        Jelly.Observers.remove.call(this, index, index + 1);
      }
    },

    remove: function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    }
  },

  Pages: {
    init: function() {
      this.all = {};
      Jelly.all = this.all; // Deprecated
    },

    add: function(name) {
      var page = new Jelly.Page.Constructor(name);
      for (var i = 1; i < arguments.length; i++) {
        $.extend(page, arguments[i]);
      }
      return page;
    }
  },

  Page: {
    init: function(controllerName, actionName) {
      var page = Jelly.Pages.all[controllerName] || new Jelly.Page.Constructor(controllerName);
      window.page = page;
      if (page.all) page.all();
      if (page[actionName]) page[actionName].call(page);
      page.loaded = true;
      return page;
    },
    Constructor: function(name) {
      this.loaded = false;
      this.documentHref = Jelly.Location.documentHref;

      this.name = name;
      Jelly.Pages.all[name] = this;
    }
  },

  Location: {
    on_redirect: function(location) {
      top.location.href = location;
    }
  }
});
Jelly.add = Jelly.Pages.add; // Deprecated

Jelly.init();
