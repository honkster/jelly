module JellyController
  protected
  include Jelly::Common

  def render_jelly_ops(options={}, &block)
    options.symbolize_keys!
    options[:format] ||= if params[:callback]
      :jsonp
    elsif request.xhr?
      :json
    else
      :iframe
    end
    render :inline => render_jelly_ops_erb(options, &block)
  end

  def render_jelly_ops_erb(options={}, &block)
    options[:format] ||= :json
    @jelly_block = block
    case options[:format].to_sym
      when :iframe
        <<-ERB
        <textarea>#{render_jelly_ops_erb_template}</textarea>
        ERB
      when :jsonp
        <<-ERB
        #{params[:callback]}(#{render_jelly_ops_erb_template});
        ERB
      else
        <<-ERB
        #{render_jelly_ops_erb_template}
        ERB
    end
  end

  def render_jelly_ops_erb_template
    <<-ERB
    <%=begin
      instance_eval(&controller.instance_variable_get(:@jelly_block))
      jelly_ops.to_json.html_safe
    end -%>
    ERB
  end

  ### Old Methods ###

  def jelly_callback(callback_base_name = @action_name, options = {}, &block)
    raise Jelly::OldMethodError
  end

  def raw_jelly_callback(options={}, &block)
    raise Jelly::OldMethodError
  end

  def jelly_callback_erb(options={}, &block)
    raise Jelly::OldMethodError
  end

  def jelly_callback_erb_template
    raise Jelly::OldMethodError
  end
end
