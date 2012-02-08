module Jelly
  module Common
    def jelly_notify_hash(method, *arguments)
      {"method" => method, "arguments" => arguments}
    end

    def jelly_callback_hash(method, *arguments)
      warn "jelly_callback_hash has been deprecated. Please use jelly_notify_hash instead"
      jelly_notify_hash(method, *arguments)
    end

    def jelly_method_call_hash(object, method, *arguments)
      {"on" => object, "method" => method, "arguments" => arguments}
    end

    def jelly_notify_attach_hash (components=jelly_attachments)
      {"attach" => components}
    end

    def jelly_attachment_hash(component_name, *args)
      {'component' => component_name, 'arguments' => args}
    end

    def jelly_attachment_array(component_name, *args)
      [component_name, *args]
    end
  end
end