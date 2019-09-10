require 'highline/import'
require 'json'
require 'mechanize'

require './remover'

extra_imege_dir = File.expand_path(File.dirname(__FILE__)) + "/../decomoji/extra"
remover = Remover.new(remove_img_dir: extra_imege_dir)
remover.serial
puts 'Done!'
