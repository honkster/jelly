require "rubygems"
require "bundler"
Bundler.setup
require 'rake/rdoctask'
require "rspec/core/rake_task"

desc 'Default: run specs'
task :default => :spec

desc 'Test the jelly plugin with Rspec.'
RSpec::Core::RakeTask.new(:spec) do |t|
  t.pattern = 'spec/**/*_spec.rb'
  t.verbose = true
end

desc 'Generate documentation for the jelly plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'Jelly.'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
end
