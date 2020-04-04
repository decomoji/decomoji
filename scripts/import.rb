require 'highline/import'
require 'json'
require 'mechanize'

# sample command
#   - bundle exec ruby import.rb preview dir account.json
#   - bundle exec ruby import.rb alias-standard.json alias account.json

require './importer'
importer = Importer.new(import_target: ARGV[0], import_mode: ARGV[1], account: ARGV[2])
importer.serial
puts 'Done!'
