module Jelly
  class OldMethodError < NotImplementedError
  end

  module Common
    def jelly_attach_op(component_name, *args)
      ["attach", component_name, *args]
    end

    def jelly_notify_op(message_name, *args)
      ["notify", message_name, *args]
    end

    def jelly_call_op(object, method, *args)
      ["call", object, method, *args]
    end

    ### Old Methods ###

    def jelly_notify_hash(method, *arguments)
      raise Jelly::OldMethodError
    end

    def jelly_callback_hash(method, *arguments)
      raise Jelly::OldMethodError
    end

    def jelly_method_call_hash(object, method, *arguments)
      raise Jelly::OldMethodError
    end

    def jelly_notify_attach_hash (components=jelly_ops)
      raise Jelly::OldMethodError
    end

    def jelly_attachment_hash(component_name, *args)
      raise Jelly::OldMethodError
    end

    def jelly_attachment_array(component_name, *args)
      raise Jelly::OldMethodError
    end
  end
end