require 'highline/import'
require 'json'
require 'mechanize'

# sample command
#   - bundle exec ruby import.rb preview account.json

require './importer'
importer = Importer.new(import_target: ARGV[0], account: ARGV[1])
importer.serial
puts 'Done!'
