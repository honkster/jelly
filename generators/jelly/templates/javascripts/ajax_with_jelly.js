if(!window.Jelly) window.Jelly = {};

(Jelly.defineAjaxWithJellyFunctions = function($) {
  $.ajaxWithJelly = function(params) {
    $.ajax($.ajaxWithJelly.params(params));
  };

  if ($.fn.ajaxForm) {
    $.fn.ajaxFormWithJelly = function(params) {
      this.ajaxForm($.ajaxWithJelly.params(params));
    };
  }

  $.ajaxWithJelly.params = function(otherParams) {
    otherParams = otherParams || {};

    return $.extend({
      dataType: 'json',
      cache: false,
      success : function(callbacks) {
        Jelly.Observers.notify.call(otherParams.observers || Jelly.observers, callbacks);
      }
    }, otherParams);
  };
})(jQuery);
