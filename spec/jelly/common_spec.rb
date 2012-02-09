require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe Jelly::Common do
  attr_reader :fixture
  before do
    @fixture = Class.new do
      include Jelly::Common
    end.new
  end

  describe "#jelly_notify_op" do
    it "creates a notify op with a method and arguments" do
      fixture.jelly_notify_op("my_method", 1, 2, 3).should == ["notify", "my_method", 1, 2, 3]
    end
  end

  describe "#jelly_call_op" do
    it "creates a call op with object, method, and arguments" do
      fixture.jelly_call_op("MyObject", "my_method", 1, 2, 3).should == ["call", "MyObject", "my_method", 1, 2, 3]
    end
  end
end