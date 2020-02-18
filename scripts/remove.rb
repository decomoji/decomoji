require 'highline/import'
require 'json'
require 'mechanize'

require './remover'
remover = Remover.new(remove_img_target: ARGV[0], target_mode: ARGV[1])
remover.serial
puts 'Done!'
