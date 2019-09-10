require 'highline/import'
require 'json'
require 'mechanize'

require './importer'

extra_imege_dir = File.expand_path(File.dirname(__FILE__)) + "/../decomoji/extra"
importer = Importer.new(import_img_dir: extra_imege_dir)
importer.serial
puts 'Done!'
