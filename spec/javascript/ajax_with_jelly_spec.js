describe("Jelly", function() {
  beforeEach(function() {
    Jelly.add("MyPage", {
      on_my_method : function() {
      }
    });
    page = Jelly.all["MyPage"];
    spyOn($, 'ajax');
  });

  afterEach(function() {
    delete Jelly.all["MyPage"];
  });

  describe(".ajaxWithJelly", function() {
    it("should set default params and call ajax", function() {
      var params = {foo: "bar"};
      var modifiedParams = "whatever";
      spyOn($.ajaxWithJelly, 'params').andReturn(modifiedParams);
      $.ajaxWithJelly(params);
      expect($.ajaxWithJelly.params).wasCalled();
      expect($.ajaxWithJelly.params).wasCalledWith(params);
      expect($.ajax).wasCalled();
      expect($.ajax).wasCalledWith(modifiedParams);
    });
  });

  describe(".ajaxWithJelly.params", function() {
    it("should set some base params", function() {
      var ajaxParams = $.ajaxWithJelly.params();
      expect(ajaxParams['dataType']).toEqual('json');
      expect(ajaxParams['cache']).toBeFalsy();
      expect(ajaxParams['success']).toBeTruthy();
    });

    it("should preserve passed data", function() {
      var ajaxParams = $.ajaxWithJelly.params({foo : 'bar', data: {bar : 'baz'}});
      expect(ajaxParams['foo']).toEqual('bar');
      expect(ajaxParams['data']['bar']).toEqual('baz');
    });

    it("should allow override of type", function() {
      var ajaxParams = $.ajaxWithJelly.params({type : 'DELETE'});
      expect(ajaxParams['type']).toEqual('DELETE');
    });

    describe(".ajaxWithJelly.params.success", function() {
      describe("when no observers are passed into params", function() {
        it("calls Jelly.notifyObservers on Jelly.observers", function() {
          var observerArgs;
          var observer = {
            on_my_method: function(arg1, arg2) {
              observerArgs = [arg1, arg2];
            }
          };
          Jelly.attach(observer);
          expect(Jelly.observers).toContain(observer);

          var op = ["notify", "on_my_method", "arg1", "arg2"];
          $.ajaxWithJelly.params().success([op]);

          expect(observerArgs).toEqual(["arg1", "arg2"]);
        });
      });

      describe("when observers are passed into params", function() {
        it("calls Jelly.notifyObservers on passed-in observers", function() {
          var observerArgs;
          var observer = {
            on_my_method: function(arg1, arg2) {
              observerArgs = [arg1, arg2];
            }
          };
          var observers = [observer];
          expect(Jelly.observers).toNotContain(observer);

          var op = ["notify", "on_my_method", "arg1", "arg2"];
          $.ajaxWithJelly.params({observers: observers}).success([op]);

          expect(observerArgs).toEqual(["arg1", "arg2"]);
        });
      });
    });
  });


  describe(".ajaxFormWithJelly", function() {

    describe("without ajaxForm plugin", function() {
      it("should not be defined", function() {
        expect($.fn.ajaxForm).toEqual(undefined);
        expect($.fn.ajaxFormWithJelly).toEqual(undefined);
      });
    });

    describe("with ajaxForm plugin", function() {
      var $form;
      beforeEach(function() {
        $form = $('body').append('<form id="myForm"></form>').find('#myForm');
        $.fn.ajaxForm = {};
        spyOn($.fn, 'ajaxForm');
        Jelly.defineAjaxWithJellyFunctions($);
      });

      afterEach(function() {
        $.fn.ajaxForm = undefined;
        Jelly.defineAjaxWithJellyFunctions($);
      });

      it("should set default params and call ajax", function() {
        var modifiedParams = "whatever";
        spyOn($.ajaxWithJelly, 'params').andReturn(modifiedParams);
        $form.ajaxFormWithJelly();
        expect($.ajaxWithJelly.params).wasCalled();
        expect($.ajaxWithJelly.params).wasCalledWith(undefined);
        expect($.fn.ajaxForm).wasCalled();
        expect($.fn.ajaxForm).wasCalledWith(modifiedParams);
        expect($.fn.ajaxForm.mostRecentCall.object.get(0)).toEqual($form.get(0));
      });

      it("should merge in params", function() {
        var params = {foo: "bar"};
        spyOn($.ajaxWithJelly, 'params');
        $form.ajaxFormWithJelly(params);
        expect($.ajaxWithJelly.params).wasCalled();
        expect($.ajaxWithJelly.params).wasCalledWith(params);
      });
    });
  });
});
