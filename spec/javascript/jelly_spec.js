describe("Jelly", function () {
  var our_token;

  beforeEach(function () {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
  });

  describe(".add", function () {
    afterEach(function () {
      delete Jelly.Pages.all["test-name"];
    });

    it("instantiates a Page with the passed-in name and attaches the set of passed-in functions to the Page object", function () {
      expect(Jelly.Pages.all["test-name"]).toEqual(undefined);

      var showFn = function () {
      };
      var newFn = function () {
      };
      var indexFn = function () {
      };
      var newPage = Jelly.Pages.add("test-name", {show:showFn}, {'new':newFn}, {index:indexFn});
      expect(Jelly.Pages.all["test-name"]).toNotEqual(undefined);
      expect(newPage).toEqual(Jelly.Pages.all["test-name"]);
      expect(newPage.show).toEqual(showFn);
      expect(newPage['new']).toEqual(newFn);
      expect(newPage.index).toEqual(indexFn);
    });
  });

  describe(".run", function () {
    describe("attach", function () {
      describe("when the component does not respond to init", function () {
        describe("when the component is referenced as a String", function () {
          beforeEach(function () {
            window.MyComponent = {
            };
          });

          afterEach(function () {
            delete window.MyComponent;
          });

          it("attaches the component to Jelly.observers", function () {
            Jelly.run(["attach", "MyComponent"]);
            expect(Jelly.observers).toContain(MyComponent);
          });
        });

        describe("when the component is referenced as itself", function () {
          it("attaches the component to Jelly.observers", function () {
            var component = {};
            Jelly.run(["attach", component]);
            expect(Jelly.observers).toContain(component);
          });
        });
      })

      describe("when component responds to init", function () {
        describe("when the component's init method returns undefined", function () {
          describe("when the component is referenced as a String", function () {
            beforeEach(function () {
              window.MyComponent = {
                init:function () {
                }
              };
            });

            afterEach(function () {
              delete window.MyComponent;
            });

            it("calls the init method on the component and attaches the component to Jelly.observers", function () {
              spyOn(MyComponent, 'init');
              Jelly.run(["attach", MyComponent, 1, 2]);
              expect(MyComponent.init).wasCalledWith(1, 2);
              expect(Jelly.observers).toContain(MyComponent);
            });
          });

          describe("when the component is referenced as itself", function () {
            var component;
            beforeEach(function () {
              component = {
                init:function () {
                }
              };
            });

            it("calls the init method on the component and attaches the component to Jelly.observers", function () {
              spyOn(component, 'init');
              Jelly.run(["attach", component, 1, 2]);
              expect(component.init).wasCalledWith(1, 2);
              expect(Jelly.observers).toContain(component);
            });
          });
        });

        describe("when the component's init method returns false", function () {
          var component;
          beforeEach(function () {
            component = {
              init:function () {
                component.initCalled = true;
                return false;
              }
            };
          });

          it("calls the init method on the component and does not attaches an observer to Jelly.observers", function () {
            var originalObserversLength = Jelly.observers.length;
            Jelly.run(["attach", component, 1, 2]);
            expect(component.initCalled).toBeTruthy();
            expect(Jelly.observers.length).toEqual(originalObserversLength);
            expect(Jelly.observers).toNotContain(component);
          });
        });

        describe("when the component's init method returns null", function () {
          var component;
          beforeEach(function () {
            component = {
              init:function () {
                component.initCalled = true;
                return null;
              }
            };
          });

          it("calls the init method on the component and does not attaches an observer to Jelly.observers", function () {
            var originalObserversLength = Jelly.observers.length;
            Jelly.run(["attach", component, 1, 2]);
            expect(component.initCalled).toBeTruthy();
            expect(Jelly.observers.length).toEqual(originalObserversLength);
            expect(Jelly.observers).toNotContain(component);
          });
        });

        describe("when the component's init method returns an object", function () {
          it("attaches the returned object (instead of the component) to Jelly.observers", function () {
            var observer = new Object();
            var component = {
              init:function () {
                return observer;
              }
            };
            Jelly.run(["attach", component, 1, 2]);
            expect(Jelly.observers).toContain(observer);
            expect(Jelly.observers).toNotContain(component);
          });
        });
      });
    });

    describe("notify", function () {
      beforeEach(function () {
        Jelly.Pages.add("MyPage", {
          on_my_method:function () {
          }
        });
        Jelly.run(["attach", "Jelly.Page", "MyPage", "index"]);
      });

      describe("when bound to the default Jelly.observers collection", function () {
        describe("the active page object", function () {
          describe("when the notify method is defined on the page", function () {
            it("should call the notify method on the page", function () {
              spyOn(page, 'on_my_method');
              Jelly.run(["notify", "on_my_method", "arg1", "arg2"]);
              expect(page.on_my_method).wasCalled();
              expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
            });

            describe("when there are attached components", function () {
              it("calls the notify methods in the order of the attached components", function () {
                var component = {
                  on_my_method:function () {
                  }
                };
                Jelly.attach(component);

                var functionsCalledInOrder = [];
                spyOn(page, 'on_my_method').andCallFake(function () {
                  functionsCalledInOrder.push("page");
                });
                spyOn(component, 'on_my_method').andCallFake(function () {
                  functionsCalledInOrder.push("component");
                });
                Jelly.run(["notify", "on_my_method", "arg1", "arg2"]);
                expect(page.on_my_method).wasCalled();
                expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
                expect(component.on_my_method).wasCalled();
                expect(component.on_my_method).wasCalledWith('arg1', 'arg2');
                expect(functionsCalledInOrder).toEqual(["page", "component"]);
              });
            });
          });

          describe("when the page object does not define the notify method", function () {
            it("does not blow up", function () {
              expect(page.on_my_undefined_method).toBe(undefined);
              Jelly.run(["notify", "on_my_undefined_method", "arg1", "arg2"]);
            });
          });
        });

        describe("when the 'on' parameter is present", function () {
          beforeEach(function () {
            GlobalObject = {on_my_method:function () {
            }};
            GlobalObject.secondObject = {on_my_method:function () {
            }};
          });

          afterEach(function () {
            delete GlobalObject;
          });
        });
      });

      describe("when bound to an array of custom observers", function () {
        it("notifies the given observers and not the existing Jelly.observers, unless in the list of observers", function () {
          var component = {
            on_my_method:function () {
            }
          };
          Jelly.attach("Jelly.Page", "MyPage", "index");
          Jelly.attach(component);

          spyOn(page, 'on_my_method');
          spyOn(component, 'on_my_method');

          var customObserver1 = {on_my_method:function () {
          }};
          spyOn(customObserver1, 'on_my_method');
          var customObserver2 = {on_my_method:function () {
          }};
          spyOn(customObserver2, 'on_my_method');

          Jelly.run.call([customObserver1, customObserver2], ["notify", "on_my_method", "arg1", "arg2"]);

          expect(page.on_my_method).wasNotCalled();
          expect(component.on_my_method).wasNotCalled();

          expect(customObserver1.on_my_method).wasCalled();
          expect(customObserver1.on_my_method).wasCalledWith('arg1', 'arg2');
          expect(customObserver2.on_my_method).wasCalled();
          expect(customObserver2.on_my_method).wasCalledWith('arg1', 'arg2');
        });
      });

      describe("an observer listening to on_notify", function () {
        it("receives a notify instruction", function () {
          var observer = {
            on_notify:function () {
            }
          };
          spyOn(observer, 'on_notify');

          Jelly.run.call([observer], ["notify", "on_my_method", "arg1", "arg2"]);

          expect(observer.on_notify).wasCalledWith("on_my_method", "arg1", "arg2");
        });
      });

      describe("an observer listening to the notify method", function () {
        var observer;
        beforeEach(function () {
          observer = {
            on_my_method:function () {
            }
          };
          Jelly.attach(observer);
          expect(Jelly.observers).toContain(observer);
        });

        describe("when the observer does not have a detach method defined", function () {
          beforeEach(function () {
            expect(observer.detach).toBe(undefined);
          });

          it("leaves the observer in Jelly.observers and calls the notify method on the observer", function () {
            spyOn(observer, "on_my_method");

            Jelly.run(["notify", "on_my_method"]);
            expect(Jelly.observers).toContain(observer);
            expect(observer.on_my_method).wasCalled();
          });
        });

        describe("when the observer a detach method defined", function () {
          describe("when the detach method is truthy", function () {
            var anotherObserver;
            beforeEach(function () {
              observer.detach = function () {
                return true;
              };
              anotherObserver = {
                on_my_method:function () {
                }
              };
              Jelly.attach(anotherObserver);
            });

            it("removes observer in Jelly.observers, does not call the notify method on the observer, and calls the other observers", function () {
              spyOn(observer, "on_my_method");
              spyOn(anotherObserver, "on_my_method");

              Jelly.run(["notify", "on_my_method"]);
              expect(Jelly.observers).toNotContain(observer);
              expect(observer.on_my_method).wasNotCalled();
              expect(anotherObserver.on_my_method).wasCalled();
            });
          });

          describe("when the detach method is falsy", function () {
            beforeEach(function () {
              observer.detach = function () {
                return undefined;
              }
            });

            it("leaves the observer in Jelly.observers and calls the notify method on the observer", function () {
              spyOn(observer, "on_my_method");

              Jelly.run(["notify", "on_my_method"]);
              expect(Jelly.observers).toContain(observer);
              expect(observer.on_my_method).wasCalled();
            });
          });
        });
      });

    });
  });

  describe(".attach", function () {
    describe("when the component does not respond to init", function () {
      describe("when the component is referenced as a String", function () {
        beforeEach(function () {
          window.MyComponent = {
          };
        });

        afterEach(function () {
          delete window.MyComponent;
        });

        it("attaches the component to Jelly.observers", function () {
          Jelly.attach("MyComponent");
          expect(Jelly.observers).toContain(MyComponent);
        });
      });

      describe("when the component is referenced as itself", function () {
        it("attaches the component to Jelly.observers", function () {
          var component = {};
          Jelly.attach(component);
          expect(Jelly.observers).toContain(component);
        });
      });
    });

    describe("when component responds to init", function () {
      describe("when the component's init method returns undefined", function () {
        describe("when the component is referenced as a String", function () {
          beforeEach(function () {
            window.MyComponent = {
              init:function () {
              }
            };
          });

          afterEach(function () {
            delete window.MyComponent;
          });

          it("calls the init method on the component and attaches the component to Jelly.observers", function () {
            spyOn(MyComponent, 'init');
            Jelly.attach(MyComponent, 1, 2);
            expect(MyComponent.init).wasCalledWith(1, 2);
            expect(Jelly.observers).toContain(MyComponent);
          });
        });

        describe("when the component is referenced as itself", function () {
          var component;
          beforeEach(function () {
            component = {
              init:function () {
              }
            };
          });

          it("calls the init method on the component and attaches the component to Jelly.observers", function () {
            spyOn(component, 'init');
            Jelly.attach(component, 1, 2);
            expect(component.init).wasCalledWith(1, 2);
            expect(Jelly.observers).toContain(component);
          });
        });
      });

      describe("when the component's init method returns false", function () {
        var component;
        beforeEach(function () {
          component = {
            init:function () {
              component.initCalled = true;
              return false;
            }
          };
        });

        it("calls the init method on the component and does not attaches an observer to Jelly.observers", function () {
          var originalObserversLength = Jelly.observers.length;
          Jelly.attach(component, 1, 2);
          expect(component.initCalled).toBeTruthy();
          expect(Jelly.observers.length).toEqual(originalObserversLength);
          expect(Jelly.observers).toNotContain(component);
        });
      });

      describe("when the component's init method returns null", function () {
        var component;
        beforeEach(function () {
          component = {
            init:function () {
              component.initCalled = true;
              return null;
            }
          };
        });

        it("calls the init method on the component and does not attaches an observer to Jelly.observers", function () {
          var originalObserversLength = Jelly.observers.length;
          Jelly.attach(component, 1, 2);
          expect(component.initCalled).toBeTruthy();
          expect(Jelly.observers.length).toEqual(originalObserversLength);
          expect(Jelly.observers).toNotContain(component);
        });
      });

      describe("when the component's init method returns an object", function () {
        it("attaches the returned object (instead of the component) to Jelly.observers", function () {
          var observer = new Object();
          var component = {
            init:function () {
              return observer;
            }
          };
          Jelly.attach(component, 1, 2);
          expect(Jelly.observers).toContain(observer);
          expect(Jelly.observers).toNotContain(component);
        });
      });
    });
  });

  describe(".Observers.notify", function () {
    beforeEach(function () {
      Jelly.Pages.add("MyPage", {
        on_my_method:function () {
        }
      });
      Jelly.attach("Jelly.Page", "MyPage", "index");
    });

    describe("when bound to the default Jelly.observers collection", function () {
      describe("the active page object", function () {
        describe("when the notify method is defined on the page", function () {
          it("should call the notify method on the page", function () {
            spyOn(page, 'on_my_method');
            Jelly.notifyObservers("on_my_method", "arg1", "arg2");
            expect(page.on_my_method).wasCalled();
            expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
          });

          describe("when there are attached components", function () {
            it("calls the notify methods in the order of the attached components", function () {
              var component = {
                on_my_method:function () {
                }
              };
              Jelly.attach(component);

              var functionsCalledInOrder = [];
              spyOn(page, 'on_my_method').andCallFake(function () {
                functionsCalledInOrder.push("page");
              });
              spyOn(component, 'on_my_method').andCallFake(function () {
                functionsCalledInOrder.push("component");
              });
              Jelly.notifyObservers("on_my_method", "arg1", "arg2");
              expect(page.on_my_method).wasCalled();
              expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
              expect(component.on_my_method).wasCalled();
              expect(component.on_my_method).wasCalledWith('arg1', 'arg2');
              expect(functionsCalledInOrder).toEqual(["page", "component"]);
            });
          });
        });

        describe("when the page object does not define the notify method", function () {
          it("does not blow up", function () {
            expect(page.on_my_undefined_method).toBe(undefined);
            Jelly.notifyObservers("on_my_undefined_method", "arg1", "arg2");
          });
        });
      });

      describe("when the 'on' parameter is present", function () {
        beforeEach(function () {
          GlobalObject = {on_my_method:function () {
          }};
          GlobalObject.secondObject = {on_my_method:function () {
          }};
        });

        afterEach(function () {
          delete GlobalObject;
        });
      });
    });

    describe("when bound to an array of custom observers", function () {
      it("notifies the given observers and not the existing Jelly.observers, unless in the list of observers", function () {
        var component = {
          on_my_method:function () {
          }
        };
        Jelly.attach("Jelly.Page", "MyPage", "index");
        Jelly.attach(component);

        spyOn(page, 'on_my_method');
        spyOn(component, 'on_my_method');

        var customObserver1 = {on_my_method:function () {
        }};
        spyOn(customObserver1, 'on_my_method');
        var customObserver2 = {on_my_method:function () {
        }};
        spyOn(customObserver2, 'on_my_method');

        Jelly.notifyObservers.call([customObserver1, customObserver2], "on_my_method", "arg1", "arg2");

        expect(page.on_my_method).wasNotCalled();
        expect(component.on_my_method).wasNotCalled();

        expect(customObserver1.on_my_method).wasCalled();
        expect(customObserver1.on_my_method).wasCalledWith('arg1', 'arg2');
        expect(customObserver2.on_my_method).wasCalled();
        expect(customObserver2.on_my_method).wasCalledWith('arg1', 'arg2');
      });
    });

    describe("an observer listening to on_notify", function () {
      it("receives a notify instruction", function () {
        var observer = {
          on_notify:function () {
          }
        };
        spyOn(observer, 'on_notify');

        Jelly.notifyObservers.call([observer], "on_my_method", "arg1", "arg2");

        expect(observer.on_notify).wasCalledWith("on_my_method", "arg1", "arg2");
      });
    });

    describe("an observer listening to the notify method", function () {
      var observer;
      beforeEach(function () {
        observer = {
          on_my_method:function () {
          }
        };
        Jelly.attach(observer);
        expect(Jelly.observers).toContain(observer);
      });

      describe("when the observer does not have a detach method defined", function () {
        beforeEach(function () {
          expect(observer.detach).toBe(undefined);
        });

        it("leaves the observer in Jelly.observers and calls the notify method on the observer", function () {
          spyOn(observer, "on_my_method");

          Jelly.notifyObservers("on_my_method");
          expect(Jelly.observers).toContain(observer);
          expect(observer.on_my_method).wasCalled();
        });
      });

      describe("when the observer a detach method defined", function () {
        describe("when the detach method is truthy", function () {
          var anotherObserver;
          beforeEach(function () {
            observer.detach = function () {
              return true;
            };
            anotherObserver = {
              on_my_method:function () {
              }
            };
            Jelly.attach(anotherObserver);
          });

          it("removes observer in Jelly.observers, does not call the notify method on the observer, and calls the other observers", function () {
            spyOn(observer, "on_my_method");
            spyOn(anotherObserver, "on_my_method");

            Jelly.notifyObservers("on_my_method");
            expect(Jelly.observers).toNotContain(observer);
            expect(observer.on_my_method).wasNotCalled();
            expect(anotherObserver.on_my_method).wasCalled();
          });
        });

        describe("when the detach method is falsy", function () {
          beforeEach(function () {
            observer.detach = function () {
              return undefined;
            }
          });

          it("leaves the observer in Jelly.observers and calls the notify method on the observer", function () {
            spyOn(observer, "on_my_method");

            Jelly.notifyObservers("on_my_method");
            expect(Jelly.observers).toContain(observer);
            expect(observer.on_my_method).wasCalled();
          });
        });
      });
    });
  });
});

describe("Jelly.Page", function () {
  var our_token;

  beforeEach(function () {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
  });

  describe(".init", function () {
    beforeEach(function () {
      Jelly.Pages.add("DefinedComponent", {
        baz:function () {
        },
        all:function () {
        },
        show:function () {
        }
      });
      spyOn(Jelly.Pages.all["DefinedComponent"], "show");
    });

    afterEach(function () {
      delete Jelly.Pages.all["DefinedComponent"];
    });

    describe("when the passed-in controllerName is defined", function () {
      describe("when the actionName is defined", function () {
        it("invokes the page-specific method", function () {
          var foobar = Jelly.Pages.all["DefinedComponent"];
          expect(foobar.show).wasNotCalled();
          Jelly.Page.init("DefinedComponent", "show");
          expect(foobar.show).wasCalled();
        });

        describe("when the 'all' method is defined", function () {
          var invokedMethods;
          beforeEach(function () {
            invokedMethods = [];
            spyOn(Jelly.Pages.all["DefinedComponent"], "all").andCallFake(function () {
              invokedMethods.push("all");
            });
            spyOn(Jelly.Pages.all["DefinedComponent"], "baz").andCallFake(function () {
              invokedMethods.push("baz");
            });
          });

          it("invokes the all method before invoking the page-specific method", function () {
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("DefinedComponent", "baz");
            expect(invokedMethods).toEqual(['all', 'baz']);
          });
        });
      });

      describe("when the actionName is not defined", function () {
        it("does not blow up", function () {
          expect(Jelly.Pages.all["DefinedComponent"].easterBunny).toEqual(undefined);
          Jelly.Page.init("DefinedComponent", "easterBunny");
        });

        describe("when the 'all' method is defined", function () {
          var invokedMethods;
          beforeEach(function () {
            invokedMethods = [];
            Jelly.Pages.all["DefinedComponent"].all = function () {
              invokedMethods.push("all");
            };
          });

          it("invokes the all method", function () {
            expect(Jelly.Pages.all["DefinedComponent"].easterBunny).toEqual(undefined);
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("DefinedComponent", "easterBunny");
            expect(invokedMethods).toEqual(['all']);
          });
        });
      });
    });

    describe("when the passed-in controllerName is not defined", function () {
      it("does nothing and does not cause an error", function () {
        expect(Jelly.Pages.all["UndefinedComponent"]).toEqual(undefined);
        Jelly.Page.init("UndefinedComponent", "easterBunny");
      });
    });
  });
});

describe("Jelly.Location", function () {
  var our_token, originalTop;

  beforeEach(function () {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
    originalTop = window.top;
  });

  afterEach(function () {
    window.top = originalTop;
  });

  describe(".on_redirect", function () {
    it("sets top.location.href to the given location", function () {
      var window = {top:{location:{}}};
      spyOn(Jelly.Location, "window").andReturn(window);
      Jelly.Location.on_redirect("http://mars.com");
      expect(window.top.location.href).toEqual("http://mars.com");
    });
  });
});
