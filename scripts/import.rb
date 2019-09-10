require 'highline/import'
require 'json'
require 'mechanize'

require './importer'

importer = Importer.new
importer.serial
puts 'Done!'
