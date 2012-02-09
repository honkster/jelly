require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe JellyHelper, :type => :helper do

  def jelly_ops(html)
    JSON.parse(Regexp.new('Jelly\.run\.apply\(Jelly, (.*)\);').match(html)[1])
  end

  describe "#spread_jelly" do
    before do
      stub_controller = mock! do |controller|
        controller.controller_path {'my_fun_controller'}
        controller.action_name {'super_good_action'}
      end
      stub(helper).controller {stub_controller}
    end

    it "should create a javascript include tag that attaches the Jelly.Location and Jelly.Page components" do
      output = helper.spread_jelly
      output.should include('<script type="text/javascript">')
      doc = Nokogiri::HTML(output)
      ops = jelly_ops(doc.at("script").inner_html)
      ops.should include(["attach", "Jelly.Location"])
      ops.should include(["attach", "Jelly.Page", 'MyFunController', 'super_good_action'])
    end
  end

  describe "#application_jelly_files" do
    context "when passing in a jelly path" do
      it "returns the javascript files in /javascipts/:jelly_path/pages and /javascipts/:jelly_path/components" do
        my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
        files = helper.application_jelly_files("foo", my_rails_root)
        files.should_not be_empty
        files.should =~ ['foo/components/paw', 'foo/components/teeth', 'foo/pages/lions', 'foo/pages/tigers', 'foo/pages/bears']
      end
    end

    context "when not passing in a jelly path" do
      it "returns the javascript files in /javascipts/pages and /javascipts/components" do
        my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
        files = helper.application_jelly_files("", my_rails_root)
        files.should_not be_empty
        files.should =~ ['components/component1', 'pages/page1']
      end
    end
  end

  describe "#jelly_attach" do
    before do
      def helper.form_authenticity_token
        "12345"
      end
    end

    after do
      helper.jelly_clear_ops()
    end

    it "fails to add multiple calls to Jelly.attach for the same component" do
      helper.jelly_attach("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.jelly_attach("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.jelly_attach("MyComponent", 'arg1', 'arg2', 'arg5')
      helper.instance_variable_get(:@jelly_ops).should == [
        ["attach", "MyComponent", 'arg1', 'arg2', 'arg3'],
        ["attach", "MyComponent", 'arg1', 'arg2', 'arg5'],
      ]
    end

    it "adds a call to Jelly.attach" do
      helper.jelly_attach("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.instance_variable_get(:@jelly_ops).should include(
        ["attach", "MyComponent", 'arg1', 'arg2', 'arg3']
      )

      html = helper.spread_jelly
      doc = Nokogiri::HTML(html)
      document_ready_tag = doc.at("script")
      document_ready_part = document_ready_tag.inner_html.split("\n")[2]
      arguments = jelly_ops(document_ready_part)
      arguments.should include(["attach", "MyComponent", 'arg1', 'arg2', 'arg3'])
    end

  end

end