require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe ApplicationController, :type => :controller do
  render_views
  include ActionController::Testing
  
  describe "#render_jelly_ops" do
    attr_reader :response
    before do
      @response = Struct.new(:body, :content_type).new
      @controller.instance_variable_set(:@_response, response)
    end

    it "have the method included" do
      @controller.respond_to?(:render_jelly_ops).should be_true
    end

    context "when given a format" do
      describe "json" do
        it "responds with a json array of arrays, even if the request is not xhr" do
          stub(request).xhr? {false}

          @controller.send(:render_jelly_ops, :format => :json) do
            jelly_notify("foo", "grape")
          end
          ops = JSON.parse(response.body)
          ops.should == [
            ["notify", "foo", "grape"]
          ]
        end
      end

      describe "jsonp" do
        it "responds with a jsonp callback based on the callback param" do
          @controller.params[:callback] = "Jelly.run"

          @controller.send(:render_jelly_ops, :format => :jsonp) do
            jelly_notify("foo", "grape")
          end
          json = Regexp.new(  'Jelly\.run\((.*)\);').match(response.body)[1]
          ops = JSON.parse(json)
          ops.should == [
            ["notify", "foo", "grape"]
          ]
        end
      end

      describe "iframe" do
        it "responds with a the json in a textarea tag" do
          @controller.send(:render_jelly_ops, :format => :iframe) do
            jelly_notify("foo", "grape")
          end
          body = response.body
          body.should =~ /^ *<textarea>/
          body.should =~ /<\/textarea> *$/
          doc = Nokogiri::HTML(body)

          ops = JSON.parse(doc.at("textarea").inner_html)
          ops.should == [
            ["notify", "foo", "grape"]
          ]
        end
      end
    end

    context "when the request is XHR" do
      before do
        stub(request).xhr? {true}
      end

      it "responds with a json hash" do
        @controller.send(:render_jelly_ops) do
          jelly_notify("foo", "grape")
        end
        ops = JSON.parse(response.body)
        ops.should == [
          ["notify", "foo", "grape"]
        ]
      end

    end

    context "when the request is not XHR" do
      before do
        stub(request).xhr? {false}
      end

      context "when there is a callback param" do
        before do
          @controller.params[:callback] = "Jelly.run"
        end

        it "responds with a call to the given callback method with the json as an argument" do
          @controller.send(:render_jelly_ops) do
            jelly_notify("foo", "grape")
          end
          json = Regexp.new('Jelly\.run\((.*)\);').match(response.body)[1]
          ops = JSON.parse(json)
          ops.should == [
            ["notify", "foo", "grape"]
          ]
        end
      end

      context "when there is not a callback param" do
        it "wraps the json response in a textarea tag to support File Uploads in an iframe target (see: http://malsup.com/jquery/form/#code-samples)" do
          @controller.send(:render_jelly_ops) do
            jelly_notify("foo", "grape")
          end
          body = response.body
          body.should =~ /^ *<textarea>/
          body.should =~ /<\/textarea>$/
          doc = Nokogiri::HTML(body)

          ops = JSON.parse(doc.at("textarea").inner_html)
          ops.should == [
            ["notify", "foo", "grape"]
          ]
        end
      end
    end
  end
end
