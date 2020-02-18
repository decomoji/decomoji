require 'highline/import'
require 'json'
require 'mechanize'

require './importer'

importer = Importer.new(import_img_dir: ARGV[0])
importer.serial
puts 'Done!'
