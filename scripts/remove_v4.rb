require 'highline/import'
require 'json'
require 'mechanize'

require './remover_json'

remover = Remover.new
remover.serial
puts 'Done!'
