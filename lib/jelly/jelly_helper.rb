module JellyHelper
  include Jelly::Common

  def application_jelly_files(jelly_files_path_from_javascripts = '', rails_root = RAILS_ROOT)
    rails_root = File.expand_path(rails_root)
    (
    Dir[File.expand_path("#{rails_root}/public/javascripts/#{jelly_files_path_from_javascripts}/components/**/*.js")] +
      Dir[File.expand_path("#{rails_root}/public/javascripts/#{jelly_files_path_from_javascripts}/pages/**/*.js")]
    ).map do |path|
      path.gsub("#{rails_root}/public/javascripts/", "").gsub(/\.js$/, "")
    end
  end

  def spread_jelly
    jelly_attach("Jelly.Location")
    jelly_attach("Jelly.Page", controller.controller_path.camelcase, controller.action_name)
    jelly_run_javascript_tag(jelly_ops)
  end

  def jelly_run_javascript_tag(ops)
    javascript_tag jelly_run_javascript(ops)
  end

  def jelly_run_javascript(ops)
    "Jelly.run.apply(Jelly, #{ops.to_json});"
  end

  def jelly_clear_ops
    jelly_ops.clear
  end

  def jelly_attach(component_name, *args, &block)
    jelly_add_op jelly_attach_op(component_name, *args), &block
  end

  def jelly_notify(message_name, *args, &block)
    jelly_add_op jelly_notify_op(message_name, *args), &block
  end

  def jelly_add_op(op, &block)
    unless jelly_ops.include? op
      if block
        yield(op)
      else
        jelly_ops << op
      end
    end
  end

  def jelly_ops
    @jelly_ops ||= []
  end

  ### Old Methods ###

  def attach_javascript_component_javascript_tag(components)
    raise Jelly::OldMethodError
  end

  def clear_jelly_attached
    raise Jelly::OldMethodError
  end

  def attach_javascript_component(component_name, *args)
    raise Jelly::OldMethodError
  end

  def jelly_attach_on_ready(component_name, *args)
    raise Jelly::OldMethodError
  end

  def jelly_attachments
    raise Jelly::OldMethodError
  end

end