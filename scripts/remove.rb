require 'highline/import'
require 'json'
require 'mechanize'

require './remover'

remover = Remover.new(remove_img_dir: ARGV[0])
remover.serial
puts 'Done!'
