require 'highline/import'
require 'json'
require 'mechanize'

# sample command
#   - bundle exec ruby replacer.rb list_v4-basic.json basic

require './replacer'
replacer = Replacer.new(remove_target: ARGV[0], import_target: ARGV[1], account: ARGV[2])
replacer.serial
puts 'Done!'
