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
      success : function(ops) {
        Jelly.Observers.run.apply(otherParams.observers || Jelly.observers, ops);
      }
    }, otherParams);
  };
})(jQuery);
